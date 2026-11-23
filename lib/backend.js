import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
export function db() {
  if (!getApps().length)
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  return getFirestore();
}
export function gateway() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
export function signed(payload, signature, secret) {
  if (!secret || !/^[0-9a-f]{64}$/i.test(signature || "")) return false;
  return timingSafeEqual(
    createHmac("sha256", secret).update(payload).digest(),
    Buffer.from(signature, "hex"),
  );
}
export function checkoutReady() {
  return [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ].every((key) => Boolean(process.env[key]));
}
export async function confirmPayment(ref, payment) {
  return db().runTransaction(async (tx) => {
    const b = (await tx.get(ref)).data();
    if (
      !b ||
      !b.orderId ||
      b.orderId !== payment.order_id ||
      payment.currency !== "INR" ||
      Number(payment.amount) !== Math.round(b.advance * 100) ||
      payment.status !== "captured"
    )
      throw Error("Payment not captured for this booking.");
    if (b.status === "confirmed") {
      if (b.paymentId !== payment.id)
        throw Error("Different payment on booking.");
      return;
    }
    tx.update(ref, {
      status: "confirmed",
      paymentId: payment.id,
      confirmedAt: new Date(),
    });
  });
}
