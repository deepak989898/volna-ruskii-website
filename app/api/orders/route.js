import { db, gateway, checkoutReady } from "../../../lib/backend";
import { settings, catalog } from "../../../lib/settings";
import { quote, today } from "../../../lib/catalog";
import { randomBytes } from "node:crypto";
export async function POST(request) {
  const fail = (error, status) => Response.json({ error }, { status });
  if (!checkoutReady()) return fail("Online payment setup is pending.", 503);
  let data;
  try {
    data = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const { name, phone, date, qty, packageId, policy } = data || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 90 ||
    typeof phone !== "string" ||
    !/^\+?[1-9]\d{7,14}$/.test(phone) ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < today()
  )
    return fail("Check your name, mobile number and visit date.", 400);
  const day = new Date(date + "T00:00:00Z");
  if (!Number.isFinite(+day) || day.toISOString().slice(0, 10) !== date)
    return fail("Invalid visit date.", 400);
  let prices;
  try {
    prices = quote(packageId, qty, await catalog());
  } catch {
    return fail("Check your package and quantity.", 400);
  }
  try {
    if (
      prices.advance !== data.displayedAdvance ||
      prices.total !== data.displayedTotal
    )
      return fail("Package prices changed. Refresh before paying.", 409);
    const s = await settings();
    if (!s.cancellationPolicy || policy !== s.cancellationPolicy)
      return fail(
        "Please refresh and review the current cancellation terms.",
        409,
      );
    const id = randomBytes(20).toString("hex");
    const ref = db().collection("bookings").doc(id);
    await ref.create({
      ...prices,
      name: name.trim(),
      phone,
      date,
      policy,
      status: "pending",
      createdAt: new Date(),
    });
    const order = await gateway().orders.create({
      amount: Math.round(prices.advance * 100),
      currency: "INR",
      receipt: id,
    });
    await ref.update({ orderId: order.id });
    return Response.json({
      id,
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    return fail("Checkout could not start. Please try again.", 503);
  }
}
