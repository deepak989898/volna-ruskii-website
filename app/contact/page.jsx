import { settings } from "../../lib/settings";
export const metadata = { title: "Location & contact" };
export default async function Contact() {
  const s = await settings();
  return (
    <main className="sheet">
      <p className="eyebrow">ARPORA · GOA</p>
      <h1>Find VOLNA</h1>
      <p>{s.address}</p>
      <iframe
        title="VOLNA Russian Night Club location"
        loading="lazy"
        src={s.mapEmbedUrl}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="links">
        <a className="gold" href={s.mapUrl} target="_blank" rel="noreferrer">
          Open Google Maps ↗
        </a>
        {s.phone && <a href={"tel:" + s.phone}>Call {s.phone}</a>}
        {s.whatsapp && (
          <a href={"https://wa.me/" + s.whatsapp.replace(/\D/g, "")}>
            WhatsApp
          </a>
        )}
        {s.email && <a href={"mailto:" + s.email}>{s.email}</a>}
      </div>
    </main>
  );
}
