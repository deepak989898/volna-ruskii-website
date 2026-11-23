export const metadata = { title: "Booking privacy" };
export default function Privacy() {
  return (
    <main className="sheet">
      <h1>Booking privacy</h1>
      <p>
        We use your name, mobile number, visit date and package selection to
        manage your reservation and entry. Razorpay handles your payment. We
        store the booking amount, payment reference and payment status with your
        reservation in Firebase.
      </p>
      <p>
        Your booking pass link is private. Share it only with guests attending
        under your reservation. Opening the venue map or show video connects to
        Google Maps or YouTube.
      </p>
      <a href="/contact">Booking and privacy enquiries →</a>
    </main>
  );
}
