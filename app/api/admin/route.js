import { getAuth } from "firebase-admin/auth";
import { db } from "../../../lib/backend";
import { defaults, googleMap } from "../../../lib/settings";
import { packages } from "../../../lib/catalog";
import {
  deskUpdate,
  packageValues,
  requireValue,
  textValue,
  InputError,
} from "../../../lib/admin-rules";
const reply = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
async function protect(req, handler) {
  const token = req.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return reply({ error: "Sign in to continue." }, 401);
  const allowed = (process.env.VOLNA_ADMIN_UIDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!allowed.length)
    return reply({ error: "Admin access is not configured." }, 503);
  let uid;
  try {
    db();
    const identity = await getAuth().verifyIdToken(token, true);
    if(Date.now()/1000 - identity.auth_time >= 900)return reply({error:"Session expired. Sign in again."},401);
    uid = identity.uid;
  } catch {
    return reply({ error: "Sign in again." }, 401);
  }
  if (!allowed.includes(uid))
    return reply({ error: "This account has no admin access." }, 403);
  try {
    return await handler(uid);
  } catch (e) {
    return e instanceof InputError
      ? reply({ error: e.message }, 400)
      : reply(
          { error: "Could not complete the request. Refresh before retrying." },
          503,
        );
  }
}
function day(value) {
  requireValue(/^\d{4}-\d{2}-\d{2}$/.test(value), "Select a visit date.");
  return value;
}
export function GET(req) {
  return protect(req, async () => {
    const q = new URL(req.url).searchParams;
    if (q.get("view") === "setup") {
      const [s, c] = await db().getAll(
        db().doc("site/public"),
        db().doc("site/catalog"),
      );
      return reply({
        fields: {
          ...defaults,
          ...Object.fromEntries(
            Object.keys(defaults)
              .filter((k) => typeof s.get(k) === "string")
              .map((k) => [k, s.get(k)]),
          ),
        },
        settingsVersion: s.get("adminVersion") ?? 0,
        packages: c.get("packages") ?? packages,
        catalogVersion: c.get("adminVersion") ?? 0,
      });
    }
    const rows = await db()
      .collection("bookings")
      .where("date", "==", day(q.get("date")))
      .get();
    return reply({
      bookings: rows.docs
        .map((doc) => {
          const b = doc.data();
          return {
            id: doc.id,
            name: b.name,
            phone: b.phone,
            packageName: b.packageName,
            status: b.status,
            guests: b.guests,
            advance: b.advance,
            balance: b.balance,
            entered: b.entered ?? 0,
            exited: b.exited ?? 0,
            collected: b.collected ?? 0,
            version: b.deskVersion ?? 0,
            updatedAt: b.deskUpdatedAt?.toDate().toISOString() ?? null,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  });
}
export function POST(req) {
  return protect(req, async (uid) => {
    const data = await req.json().catch(() => null);
    requireValue(data && typeof data === "object", "Invalid request.");
    const store = db();
    if (data.type === "desk") {
      requireValue(/^[a-f0-9]{40}$/.test(data.id), "Invalid booking.");
      const ref = store.collection("bookings").doc(data.id),
        log = ref.collection("deskEvents").doc();
      await store.runTransaction(async (tx) => {
        const b = (await tx.get(ref)).data();
        requireValue(b, "Booking not found.");
        requireValue(
          (b.deskVersion ?? 0) === data.version,
          "Booking changed. Refresh the list.",
        );
        const update = deskUpdate(b, data.action, data.amount);
        const timestamp = new Date();
        tx.update(ref, {
          ...update,
          deskVersion: data.version + 1,
          deskUpdatedAt: timestamp,
        });
        tx.create(log, {
          uid,
          action: data.action,
          amount: data.amount,
          at: timestamp,
        });
      });
      return reply({ saved: true });
    }
    requireValue(
      data.type === "settings" || data.type === "packages",
      "Unknown update.",
    );
    let changes;
    if (data.type === "packages") {
      requireValue(
        Array.isArray(data.items) &&
          data.items.length > 0 &&
          data.items.length <= 100,
        "Keep 1 to 100 packages.",
      );
      const items = data.items.map(packageValues);
      requireValue(
        new Set(items.map((p) => p.id)).size === items.length,
        "Duplicate package ID.",
      );
      changes = { packages: items };
    } else {
      requireValue(
        data.fields && typeof data.fields === "object",
        "Missing settings.",
      );
      changes = Object.fromEntries(
        Object.keys(defaults).map((k) => [
          k,
          textValue(data.fields[k], k === "cancellationPolicy" ? 12000 : 2500),
        ]),
      );
      for (const k of ["phone", "whatsapp"])
        requireValue(
          !changes[k] || /^\+?[1-9]\d{7,14}$/.test(changes[k]),
          "Use a phone number with country code.",
        );
      requireValue(
        !changes.email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.email),
        "Check the email address.",
      );
      for (const k of ["mapUrl", "mapEmbedUrl"])
        requireValue(
          !changes[k] || googleMap(changes[k], k === "mapEmbedUrl"),
          "Enter a valid Google Maps URL.",
        );
    }
    const ref = store.doc(
      data.type === "settings" ? "site/public" : "site/catalog",
    );
    await store.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      requireValue(
        (doc.get("adminVersion") ?? 0) === data.version,
        "Settings changed. Reload before saving.",
      );
      tx.set(
        ref,
        {
          ...changes,
          adminVersion: data.version + 1,
          updatedBy: uid,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    });
    return reply({ saved: true });
  });
}
