import { db, signed, confirmPayment } from "../../../lib/backend";
export async function POST(req) {
  const payload = await req.text();
  if (
    !signed(
      payload,
      req.headers.get("x-razorpay-signature"),
      process.env.RAZORPAY_WEBHOOK_SECRET,
    )
  )
    return new Response(null, { status: 403 });
  try {
    const event = JSON.parse(payload);
    if (event.event !== "payment.captured")
      return new Response(null, { status: 204 });
    const p = event.payload.payment.entity;
    const rows = await db()
      .collection("bookings")
      .where("orderId", "==", p.order_id)
      .limit(1)
      .get();
    if (rows.empty) return new Response(null, { status: 503 });
    await confirmPayment(rows.docs[0].ref, p);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
