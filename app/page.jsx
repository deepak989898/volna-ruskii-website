import Link from "next/link";
import HeroVideo from "./HeroVideo";
import { catalog, settings } from "../lib/settings";
import { quote, money } from "../lib/catalog";
const gallery = [
  [
    "show-gold",
    "Performer in a gold costume on the club stage"
  ],
  [
    "dj",
    "DJ performing at the VOLNA booth"
  ],
  [
    "show-green",
    "Stage performer under green lights"
  ],
  [
    "show-stage",
    "Live pole performance at VOLNA"
  ],
  [
    "hookah",
    "Hookah lounge at VOLNA"
  ],
  [
    "show-pink",
    "Stage performer in a pink costume"
  ]
];

export default async function Home() {
  const [packages, site] = await Promise.all([catalog(), settings()]);
  return (
    <main>
      <section className="hero heroVideo">
        <HeroVideo src={site.heroVideoUrl}
          poster={site.heroVideoUrl.includes("/o/Volna-Homepage.mp4?") ? "/volna-hero-poster.webp" : undefined} />
        <div className="heroText">
          <h1>Volna Ruskii<span>Russian Night Club · Arpora, Goa</span></h1>
        </div>
      </section>
      <section id="packages" className="packages">
        <h2>Choose your experience</h2>
        <div className="grid">
          {packages.map((p) => (
            <article key={p.id} className={p.unit === "table" ? "packagePhoto packageTable" : "packagePhoto packageEntry"}>
              <h3>{p.name}</h3>
              <div className="price">
                {money(p.price)}{" "}
                <small>
                  {p.unit === "table"
                    ? "for " + p.guests + " guests"
                    : "per guest"}
                </small>
              </div>
              <p>{p.description}</p>
              {quote(p.id, 1, packages).discount > 0 && (
                <p>Online from {money(quote(p.id, 1, packages).total)} per guest · 10% off, up to ₹500 per booking for 1–10 guests.</p>
              )}
              <p>
                {money(quote(p.id, 1, packages).advance)} online ·{" "}
                {money(quote(p.id, 1, packages).balance)} at the club
              </p>
              <Link className="gold" href={"/book?package=" + p.id}>
                {p.action} <b>→</b>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section id="gallery" className="packages venueGallery" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Inside VOLNA</h2>
        <div className="venueGalleryGrid">
          {gallery.map(([file, alt]) => (
            <img key={file} src={`/gallery/${file}.webp`} alt={alt} loading="lazy" decoding="async" />
          ))}
        </div>
        <Link className="gold" href="/gallery" style={{ marginTop: 16 }}>View all gallery ↗</Link>
      </section>
      <div className="packages clubReel">
        <a className="gold" href="https://www.instagram.com/club_volna_/reel/DfUtDz_uiFO/" target="_blank" rel="noreferrer">
          Watch on Instagram ↗
        </a>
      </div>
    </main>
  );
}
