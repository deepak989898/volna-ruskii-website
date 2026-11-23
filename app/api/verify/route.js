import { db, gateway, confirmPayment, signed } from "../../../lib/backend";
export async function POST(req) {
  try {
    const { id, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();
    if (!/^[a-f0-9]{40}$/.test(id) || !/^pay_\w+$/.test(razorpay_payment_id))
      return new Response(null, { status: 400 });
    const ref = db().collection("bookings").doc(id);
    const b = (await ref.get()).data();
    if (
      !b?.orderId ||
      b.orderId !== razorpay_order_id ||
      !signed(
        b.orderId + "|" + razorpay_payment_id,
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET,
      )
    )
      return new Response(null, { status: 403 });
    const payment = await gateway().payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured")
      return Response.json({ status: "pending" }, { status: 202 });
    await confirmPayment(ref, payment);
    return Response.json({ status: "confirmed" });
  } catch {
    return Response.json({ status: "verification pending" }, { status: 503 });
  }
}
