import { notFound } from "next/navigation";
import { db } from "../../../lib/backend";
import { money } from "../../../lib/catalog";
export const metadata = {
  title: "Booking status",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Pass({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{40}$/.test(id)) notFound();
  const b = (await db().collection("bookings").doc(id).get()).data();
  if (!b) notFound();
  if (b.status !== "confirmed")
    return (
      <main className="sheet">
        <h1>Awaiting payment confirmation</h1>
        <p>
          If money was debited, check this page again before attempting another
          payment. Keep this private link to return to your pass.
        </p>
        <a className="gold" href={"/pass/" + id}>
          Refresh status
        </a>
      </main>
    );
  return (
    <main className="sheet ticket">
      <p className="eyebrow">CONFIRMED ENTRY PASS</p>
      <h1>{b.packageName}</h1>
      <h2>{b.name}</h2>
      <p>
        {b.date} · {b.guests} guests
      </p>
      <p>
        Booking reference <b>{id.slice(-12).toUpperCase()}</b>
      </p>
      <p>
        Paid online {money(b.advance)} · Collected at club{" "}
        {money(b.collected ?? 0)} · Due at venue{" "}
        {money(Math.round((b.balance - (b.collected ?? 0)) * 100) / 100)}
      </p>
      <p>Keep this private link and show your pass on arrival.</p>
      <a href="/contact">Venue directions →</a>
    </main>
  );
}
