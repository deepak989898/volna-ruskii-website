import { cache } from "react";
import { db } from "./backend";
export const defaults = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "Calangute–Anjuna Road, Arpora, Goa",
  mapEmbedUrl: "",
  mapUrl: "",
  cancellationPolicy: "Guest cancellations and no-shows\nIf you cancel your booking, the amount already paid is non-refundable, except where a refund is required by applicable law. If you miss your booked visit date without an approved date change, the booking expires. The amount paid cannot be refunded, transferred or used for another date, except where required by applicable law.\n\nDate change requests\nYou may request a new date by emailing the club or using the contact options on the Find Us page. Send the booking reference, guest name, original visit date and preferred new date at least 24 hours before the scheduled visit time. If your confirmation lists only a date, the deadline is 24 hours before the start of that date in Goa (IST). Date changes depend on availability and take effect once the club confirms the new date. Requests after the deadline are ineligible for a date change.\n\nIf the club cancels\nIf the club cancels your booking, contact us with your booking reference for a refund or, if you prefer and space is available, a new date. These terms do not limit your rights under applicable consumer law.",
};
export function googleMap(value, embed) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      ((["www.google.com", "maps.google.com", "www.google.co.in"].includes(
        u.hostname,
      ) &&
        u.pathname.startsWith("/maps")) ||
        (!embed && u.hostname === "maps.app.goo.gl"))
      ? u.href
      : "";
  } catch {
    return "";
  }
}
import { packages } from "./catalog";

const siteData = cache(async () => {
  if (!process.env.FIREBASE_PROJECT_ID) return {};
  try {
    const store = db();
    const [info, catalog] = await store.getAll(
      store.doc("site/public"),
      store.doc("site/catalog"),
    );
    return { info: info.data(), packages: catalog.get("packages") };
  } catch (error) {
    console.error("Club settings unavailable", error.code || error.name);
    return {};
  }
});

export const settings = cache(async () => {
  let s = { ...defaults };
  const { info } = await siteData();
  for (const key of Object.keys(defaults)) {
    if (typeof info?.[key] === "string") s[key] = info[key].trim();
  }

  if (!s.cancellationPolicy) s.cancellationPolicy = defaults.cancellationPolicy;

  s.mapUrl =
    googleMap(s.mapUrl, false) ||
    "https://www.google.com/maps/search/?api=1&query=15.569709,73.7655682&query_place_id=ChIJw47-0iTrvzsRGbuLgZpVCF8";
  s.mapEmbedUrl =
    googleMap(s.mapEmbedUrl, true) ||
    "https://maps.google.com/maps?q=Club+Volna,+Calangute-Anjuna+Road,+Arpora,+Goa&z=14&output=embed";
  const video = info?.heroVideoUrl;
  s.heroVideoUrl = typeof video === "string" &&
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/volnarussianclub-7fa10\.firebasestorage\.app\/o\/hero%2F[0-9a-f-]{36}\.mp4\?alt=media&token=[0-9a-f-]{36}$/.test(video)
    ? video
    : "https://firebasestorage.googleapis.com/v0/b/volnarussianclub-7fa10.firebasestorage.app/o/Volna-Homepage.mp4?alt=media&token=1a469360-658c-46d1-973f-e0d34904bdd2";
  return s;
});

export const catalog = cache(async () => (await siteData()).packages ?? packages);
