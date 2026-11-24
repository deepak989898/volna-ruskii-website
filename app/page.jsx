import Link from "next/link";
import { catalog } from "../lib/settings";
import { quote, money } from "../lib/catalog";
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
    </main>
  );
}
