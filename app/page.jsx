import Link from "next/link";
import { catalog } from "../lib/settings";
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
  const packages = await catalog();
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
          <iframe
            title="VOLNA Russian Night Club show"
            src="https://www.youtube-nocookie.com/embed/BHbCeP3xWhM?playsinline=1"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
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
      </section>
      <section className="packages clubReel" aria-labelledby="club-reel-title">
        <div>
          <h2 id="club-reel-title">Live on the VOLNA stage</h2>
          <p>A look inside the club in Arpora, Goa.</p>
          <a href="https://www.instagram.com/club_volna_/reel/DfUtDz_uiFO/" target="_blank" rel="noreferrer">Watch on Instagram ↗</a>
        </div>
        <iframe
          title="VOLNA live stage performance on Instagram"
          src="https://www.instagram.com/reel/DfUtDz_uiFO/embed/"
          loading="lazy"
          allow="fullscreen"
          allowFullScreen
        />
      </section>
    </main>
  );
}
