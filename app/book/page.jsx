import Booking from "./Booking";
import { catalog, settings } from "../../lib/settings";
import { checkoutReady } from "../../lib/backend";
export const metadata = { title: "Book club entry or a VIP table" };
export default async function Page({ searchParams }) {
  const s = await settings();
  return (
    <main className="sheet">
      <p className="eyebrow">VOLNA · ARPORA</p>
      <h1>Book your night</h1>
      <Booking
        packages={await catalog()}
        initial={(await searchParams).package}
        policy={s.cancellationPolicy}
        ready={checkoutReady() && Boolean(s.cancellationPolicy)}
      />
    </main>
  );
}
