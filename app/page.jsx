import Link from "next/link";
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
      <section className="hero">
        <div className="light" />
        <div className="heroText">
          <p className="eyebrow">ARPORA · GOA</p>
          <h1>
            VOLNA<span>Russian Night Club</span>
          </h1>
          <a className="film" href="#club-video">
            ▷ &nbsp; Watch the club show
          </a>
        </div>
        <div className="poster" id="club-video">
          <video aria-label="VOLNA nightclub highlights" src={site.heroVideoUrl}
            autoPlay muted loop playsInline preload="auto" poster="/show.jpg" />
        </div>
      </section>
      <section id="packages" className="packages">
        <h2>Choose your experience</h2>
        <div className="grid">
          {packages.map((p) => (
            <article key={p.id}>
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
