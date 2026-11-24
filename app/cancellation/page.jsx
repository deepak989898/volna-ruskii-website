import { settings } from "../../lib/settings";
export const metadata = { title: "Cancellation & date changes" };
export default async function Cancellation() {
  const s = await settings();
  return (
    <main className="sheet venuePage">
      <h1>Cancellation & date changes</h1>
      <section className="venueCard">
        <h2>Booking terms</h2>
        <p className="policy">{s.cancellationPolicy || "The club is preparing its cancellation, refund, date-change and no-show terms. Online payments open once those terms are published."}</p>
        <h2>Request a cancellation or date change</h2>
        <p>Contact the club with your booking reference, guest name and original visit date. For a date change, include your preferred new date.</p>
        <a href="/contact">Contact the club →</a>
      </section>
    </main>
  );
}
