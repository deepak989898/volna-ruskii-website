"use client";
import { useEffect, useRef, useState } from "react";
import { money, today } from "../../lib/catalog";
const labels = {
  phone: "Phone (with country code)",
  whatsapp: "WhatsApp (with country code)",
  email: "Email",
  address: "Venue address",
  mapUrl: "Google Maps directions URL",
  mapEmbedUrl: "Google Maps embed URL",
  cancellationPolicy: "Cancellation & date-change policy",
};
export default function Panel({ apiKey }) {
  const [token, setToken] = useState(""),
    [tab, setTab] = useState("bookings"),
    [date, setDate] = useState(today),
    [search, setSearch] = useState(""),
    [rows, setRows] = useState(null),
    [setup, setSetup] = useState(null),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState(""),
    [reload, refresh] = useState(0);
  const locked = useRef(false);
  function logout() {
    setToken("");
    setRows(null);
    setSetup(null);
    setMsg("");
    setSearch("");
  }
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(logout, 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [token]);
  async function login(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
          encodeURIComponent(apiKey),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            password: form.get("password"),
            returnSecureToken: true,
          }),
        },
      );
      if (!res.ok)
        throw Error("Sign-in failed. Check your email and password.");
      setToken((await res.json()).idToken);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!token) return;
    const ctrl = new AbortController();
    setRows(null);
    setSetup(null);
    const query =
      tab === "bookings" ? "date=" + encodeURIComponent(date) : "view=setup";
    fetch("/api/admin?" + query, {
      headers: { Authorization: "Bearer " + token },
      signal: ctrl.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) logout();
          throw Error(data.error);
        }
        if (tab === "bookings") setRows(data.bookings);
        else setSetup(data);
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setMsg(e.message);
      });
    return () => ctrl.abort();
  }, [token, tab, date, reload]);
  async function save(body) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) logout();
        throw Error(data.error);
      }
      setMsg("Saved.");
      refresh((x) => x + 1);
    } catch (e) {
      setMsg(e.message);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  if (!token)
    return (
      <form className="deskbox fields" onSubmit={login}>
        <label>
          Staff email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="gold" disabled={!apiKey || busy}>
          Sign in
        </button>
        {!apiKey && <p>Staff sign-in opens after Firebase setup.</p>}
        <p role="status">{msg}</p>
      </form>
    );
  const confirmed = (rows || []).filter((b) => b.status === "confirmed"),
    sum = (fn) => confirmed.reduce((n, b) => n + fn(b), 0);
  return (
    <>
      <div className="deskTabs">
        {["bookings", "packages", "settings"].map((t) => (
          <button
            aria-pressed={tab === t}
            key={t}
            disabled={busy}
            onClick={() => {
              setMsg("");
              setTab(t);
            }}
          >
            {t}
          </button>
        ))}
        <button onClick={logout}>Sign out</button>
      </div>
      <p role="status">{msg}</p>
      {tab === "bookings" && (
        <>
          <div className="fields">
            <label>
              Visit date (Goa)
              <input
                type="date"
                value={date}
                disabled={busy}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Find guest, mobile or reference
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <button
            className="deskBtn"
            disabled={busy}
            onClick={() => refresh((x) => x + 1)}
          >
            Refresh bookings
          </button>
          {rows && (
            <>
              <div className="deskStats">
                {[
                  ["Confirmed", confirmed.length],
                  ["Expected guests", sum((b) => b.guests)],
                  ["Inside now", sum((b) => b.entered - b.exited)],
                  ["Departed", sum((b) => b.exited)],
                  ["Online paid", money(sum((b) => b.advance))],
                  ["Club collected", money(sum((b) => b.collected))],
                  ["Still due", money(sum((b) => b.balance - b.collected))],
                ].map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <Guests rows={rows} search={search} save={save} busy={busy} />
            </>
          )}
        </>
      )}
      {tab === "settings" && setup && (
        <form
          className="deskbox"
          onSubmit={(e) => {
            e.preventDefault();
            save({
              type: "settings",
              version: setup.settingsVersion,
              fields: Object.fromEntries(new FormData(e.currentTarget)),
            });
          }}
        >
          <h2>Contact & policy</h2>
          <div className="fields">
            {Object.entries(labels).map(([k, label]) => (
              <label key={k}>
                {label}
                {k === "cancellationPolicy" ? (
                  <textarea rows={6} name={k} defaultValue={setup.fields[k]} />
                ) : (
                  <input name={k} defaultValue={setup.fields[k]} />
                )}
              </label>
            ))}
          </div>
          <button className="gold" disabled={busy}>
            Save website settings
          </button>
        </form>
      )}
      {tab === "packages" && setup && (
        <Packages setup={setup} save={save} busy={busy} />
      )}
      {((tab === "bookings" && !rows) || (tab !== "bookings" && !setup)) &&
        !msg && <p>Loading…</p>}
    </>
  );
}
function Guests({ rows, search, save, busy }) {
  const filtered = rows.filter((b) =>
    [b.name, b.phone, b.id.slice(-12)]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  );
  return (
    <>
      {!filtered.length && <p>No matching bookings for this date.</p>}
      {filtered.map((b) => (
        <section key={b.id} className="deskbox">
          <small>
            {b.id.slice(-12).toUpperCase()} ·{" "}
            {b.status === "confirmed" ? "Confirmed" : "Payment pending"}
          </small>
          <h2>{b.name}</h2>
          <p>
            {b.packageName} · {b.guests} guests ·{" "}
            <a href={"tel:" + b.phone}>{b.phone}</a>
          </p>
          {b.status === "confirmed" && (
            <>
              <p>
                Awaiting arrival {b.guests - b.entered} · Inside{" "}
                {b.entered - b.exited} · Departed {b.exited}
              </p>
              <p>
                Online {money(b.advance)} · Counter {money(b.collected)} · Due{" "}
                {money(b.balance - b.collected)}
              </p>
              {b.updatedAt && (
                <small>
                  Last desk update{" "}
                  {new Date(b.updatedAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </small>
              )}
              <form
                className="deskActions"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  save({
                    type: "desk",
                    id: b.id,
                    version: b.version,
                    action: f.get("action"),
                    amount: Number(f.get("amount")),
                  });
                }}
              >
                <label>
                  Record
                  <select name="action">
                    <option value="enter">Guests arriving</option>
                    <option value="exit">Guests leaving</option>
                    <option value="collect">Counter payment (₹)</option>
                  </select>
                </label>
                <label>
                  Count / amount
                  <input
                    required
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                  />
                </label>
                <button className="gold" disabled={busy}>
                  Record
                </button>
              </form>
            </>
          )}
        </section>
      ))}
    </>
  );
}
function Packages({ setup, save, busy }) {
  const [items, setItems] = useState(
    setup.packages.map((p) => ({
      ...p,
      advancePercent: p.advancePercent ?? 50,
    })),
  );
  function change(id, k, value) {
    setItems((all) => all.map((p) => (p.id === id ? { ...p, [k]: value } : p)));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ type: "packages", items, version: setup.catalogVersion });
      }}
    >
      <h2>Published packages</h2>
      {items.map((p) => (
        <section className="deskbox fields" key={p.id}>
          {[
            ["name", "Package name"],
            ["description", "Description"],
            ["price", "Price (₹)"],
            ["guests", "Guests per unit"],
            ["advancePercent", "Advance (%)"],
          ].map(([k, label]) => {
            const num = ["price", "guests", "advancePercent"].includes(k);
            return (
              <label key={k}>
                {label}
                <input
                  type={num ? "number" : "text"}
                  required={k !== "description"}
                  min={num ? 1 : undefined}
                  value={p[k]}
                  onChange={(e) =>
                    change(
                      p.id,
                      k,
                      num ? Number(e.target.value) : e.target.value,
                    )
                  }
                />
              </label>
            );
          })}
          <label>
            Sold by
            <select
              value={p.unit}
              onChange={(e) => change(p.id, "unit", e.target.value)}
            >
              <option value="guest">Guest</option>
              <option value="table">Table</option>
            </select>
          </label>
          <button
            type="button"
            className="deskBtn"
            disabled={items.length === 1}
            onClick={() => setItems(items.filter((i) => i.id !== p.id))}
          >
            Remove from list
          </button>
        </section>
      ))}
      <div className="deskTabs">
        <button
          type="button"
          onClick={() =>
            setItems([
              ...items,
              {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                unit: "guest",
                price: 2000,
                guests: 1,
                advancePercent: 50,
              },
            ])
          }
        >
          Add package
        </button>
        <button disabled={busy} className="gold">
          Publish packages
        </button>
      </div>
    </form>
  );
}
