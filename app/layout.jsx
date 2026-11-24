import "./style.css";
import Link from "next/link";
import { settings } from "../lib/settings";
export const dynamic = "force-dynamic";
export const metadata = {
  title: {
    default: "VOLNA Russian Night Club | Entry & VIP Table in Arpora, Goa",
    template: "%s | VOLNA Russian Night Club",
  },
  description:
    "Choose club entry or a VIP table for six at VOLNA Russian Night Club in Arpora, Goa.",
};
export default async function Layout({ children }) {
  const s = await settings();
  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/" aria-label="VOLNA home">
            <img
              className="logo"
              src="/volna-eagle.png"
              alt="Volna Russian Night Club Blue Eagle"
            />
          </Link>
          <nav>
            <Link href="/#packages">Packages</Link>
            <Link href="/contact">Find us</Link>
          </nav>
        </header>
        {children}
        <footer className="venueFooter">
          <div className="footerGrid">
            <div>
              <strong>VOLNA</strong>
              <p>Russian Night Club</p>
              <address>{s.address}</address>
              <a href={s.mapUrl} target="_blank" rel="noreferrer">Get directions ↗</a>
            </div>
            <nav aria-label="Venue and booking information">
              <Link href="/#packages">Entry &amp; VIP packages</Link>
              <Link href="/contact">Location &amp; contact</Link>
              <Link href="/cancellation">Cancellation policy</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <div className="footerContact">
              <b>Contact the club</b>
              {s.phone && <a href={"tel:" + s.phone}>{s.phone}</a>}
              {s.whatsapp && <a href={"https://wa.me/" + s.whatsapp.replace(/\D/g, "")}>WhatsApp</a>}
              {s.email && <a href={"mailto:" + s.email}>{s.email}</a>}
              {!s.phone && !s.whatsapp && !s.email && <Link href="/contact">Visit &amp; contact details</Link>}
            </div>
            <iframe title="Map of VOLNA and Arpora, Goa" loading="lazy" src={s.mapEmbedUrl}
              allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </footer>
      </body>
    </html>
  );
}
