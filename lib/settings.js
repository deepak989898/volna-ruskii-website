import { cache } from "react";
import { db } from "./backend";
export const defaults = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "Calangute–Anjuna Road, Arpora, Goa",
  mapEmbedUrl: "",
  mapUrl: "",
  cancellationPolicy: "",
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
