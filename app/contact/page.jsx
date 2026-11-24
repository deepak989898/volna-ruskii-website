import { settings } from "../../lib/settings";
export const metadata = { title: "Location & contact" };
export default async function Contact() {
  const s = await settings();
  return (
    <main className="sheet venuePage">
      <p className="eyebrow">ARPORA · GOA</p>
      <h1>Location &amp; contact</h1>
      <div className="contactGrid">
        <section className="venueCard">
          <h2>Visit VOLNA</h2>
          <address>{s.address}</address>
          <a className="gold" href={s.mapUrl} target="_blank" rel="noreferrer">Get directions ↗</a>
        </section>
        <section className="venueCard footerContact">
          <h2>Contact the club</h2>
          {s.phone && <a href={"tel:" + s.phone}>Call {s.phone}</a>}
          {s.whatsapp && <a href={"https://wa.me/" + s.whatsapp.replace(/\D/g, "")}>WhatsApp {s.whatsapp}</a>}
          {s.email && <a href={"mailto:" + s.email}>{s.email}</a>}
          {!s.phone && !s.whatsapp && !s.email && <p>Contact details are being updated. Use the map for directions to the club.</p>}
        </section>
      </div>
      <iframe title="Map of VOLNA and Arpora, Goa" loading="lazy" src={s.mapEmbedUrl}
        allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
    </main>
  );
}
