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
export const settings = cache(async () => {
  let s = { ...defaults };
  if (process.env.FIREBASE_PROJECT_ID) {
    const doc = await db().doc("site/public").get();
    for (const key of Object.keys(defaults))
      if (typeof doc.get(key) === "string") s[key] = doc.get(key).trim();
  }

  s.mapUrl =
    googleMap(s.mapUrl, false) ||
    "https://www.google.com/maps/search/?api=1&query=15.569709,73.7655682&query_place_id=ChIJw47-0iTrvzsRGbuLgZpVCF8";
  s.mapEmbedUrl =
    googleMap(s.mapEmbedUrl, true) ||
    "https://maps.google.com/maps?q=15.569709,73.7655682&z=17&output=embed";
  return s;
});

import { packages } from "./catalog";
export const catalog = cache(async () => {
  if (!process.env.FIREBASE_PROJECT_ID) return packages;
  return (await db().doc("site/catalog").get()).get("packages") ?? packages;
});
