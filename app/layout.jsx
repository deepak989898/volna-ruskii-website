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
        <footer>
          <div>
            <strong>VOLNA</strong>
            <p>Russian Night Club · Arpora, Goa</p>
          </div>
          <nav>
            <Link href="/contact">Location & contact</Link>
            <Link href="/cancellation">Cancellation policy</Link>
            <Link href="/privacy">Privacy</Link>
            {s.whatsapp && (
              <a href={"https://wa.me/" + s.whatsapp.replace(/\D/g, "")}>
                WhatsApp
              </a>
            )}
          </nav>
        </footer>
      </body>
    </html>
  );
}
