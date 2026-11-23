import { settings } from "../../lib/settings";
export const metadata = { title: "Cancellation & date changes" };
export default async function Cancellation() {
  const s = await settings();
  return (
    <main className="sheet">
      <h1>Cancellation & date changes</h1>
      <p className="policy">
        {s.cancellationPolicy ||
          "The club’s cancellation and date-change terms will be published here before online payments open."}
      </p>
      <a href="/contact">Contact the club →</a>
    </main>
  );
}
