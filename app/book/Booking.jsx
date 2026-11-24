"use client";
import { useState, useEffect, useRef } from "react";
import { quote, money, today } from "../../lib/catalog";
const packageInclusions = {
  entry: [
    "Limited dinner with vegetarian and non-vegetarian options",
    "Unlimited beer",
    "One hookah pot per four guests",
    "Live Russian dance performances and DJ dance floor",
    "Temporary or permanent tattoo",
  ],
  vip: [
    "One VIP table for six guests",
    "Choose one premium bottle: Black Label, Chivas Regal or Grey Goose",
    "Choose one standard bottle: Red Label, Jameson or Absolut",
    "Six Corona pints and six Budweiser pints",
    "Choose two vegetarian starters: Paneer Tikka, Paneer Chilly or Honey Chilly Potato",
    "Choose two non-vegetarian starters: Chicken Tikka, Chicken Chilly or Chicken Dry Fry",
    "One masala papad and one peanut masala",
    "One hookah pot",
    "Water, soda and soft drinks",
  ],
};

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () =>
      reject(Error("Payment window could not load. Please retry."));
    document.head.append(script);
  });
}
export default function Booking({ packages, initial, policy, ready }) {
  const [id, setId] = useState(
      packages.some((p) => p.id === initial) ? initial : packages[0].id,
    ),
    [qty, setQty] = useState("1"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [previous, setPrevious] = useState("");
  const intent = useRef(null),
    lock = useRef(false);
  const n = Number(qty),
    valid = Number.isInteger(n) && n >= 1 && n <= 50;
  const q = valid ? quote(id, n, packages) : null;
  useEffect(() => {
    setPrevious(sessionStorage.getItem("volna-last") || "");
  }, []);
  async function pay(e) {
    e.preventDefault();
    if (lock.current) return;
    if (!valid) {
      setError("Enter a whole number from 1 to 50 for your package quantity.");
      return;
    }
    if (!ready) {
      setError("Online payment is temporarily unavailable while the club completes setup. Please try again later.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    const unlock = () => {
      lock.current = false;
      setBusy(false);
    };
    try {
      const fields = Object.fromEntries(new FormData(e.currentTarget));
      const data = {
        packageId: id,
        qty: n,
        displayedAdvance: q.advance,
        displayedTotal: q.total,
        date: fields.date,
        name: fields.name.trim(),
        phone: /^\d{10}$/.test(fields.phone.trim())
          ? "+91" + fields.phone.trim()
          : fields.phone.trim(),
        policy,
      };
      await loadCheckout();
      const fingerprint = JSON.stringify(data);
      if (intent.current?.fingerprint !== fingerprint) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const order = await res.json();
        if (!res.ok) throw Error(order.error);
        intent.current = { fingerprint, order };
      }
      const { order } = intent.current;
      const pass = "/pass/" + order.id;
      sessionStorage.setItem("volna-last", pass);
      setPrevious(pass);
      const checkout = new window.Razorpay({
        key: order.key,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: "VOLNA Russian Night Club",
        description: q.packageName + " · " + data.date,
        prefill: { name: data.name, contact: data.phone },
        theme: { color: "#152036" },
        modal: { ondismiss: unlock },
        handler: async (response) => {
          try {
            await fetch("/api/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: order.id, ...response }),
            });
          } finally {
            window.location.assign(pass);
          }
        },
      });
      checkout.open();
    } catch (err) {
      setError(err.message);
      unlock();
    }
  }
  return (
    <form className="venueCard bookingForm" onSubmit={pay}>
      <h2>Booking details</h2>
      <div className="fields">
        <label>
          Package
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setQty("1");
            }}
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Visit date
          <input type="date" name="date" min={today()} defaultValue={today()} required />
        </label>
        <label>
          {packages.find((p) => p.id === id).unit === "table"
            ? "Number of tables"
            : "Number of guests"}
          <input
            type="number"
            min="1"
            max="50"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </label>
        <label>
          Guest name
          <input name="name" autoComplete="name" maxLength="90" required />
        </label>
        <label>
          Mobile number
          <input
            type="tel"
            name="phone"
            placeholder="10-digit number or +91…"
            pattern="[+]?[1-9][0-9]{7,14}"
            title="Enter a 10-digit Indian mobile number or an international number with its country code."
            autoComplete="tel"
            required
          />
        </label>
      </div>
      {packageInclusions[id] && (
        <details className="summary" open>
          <summary>What’s included in {packages.find((item) => item.id === id).name}</summary>
          <ul>
            {packageInclusions[id].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </details>
      )}
      {q && (
        <div className="summary bookingPrice">
          <h3>Price breakdown</h3>
          <p>{q.packageName} · {q.guests} guest{q.guests === 1 ? "" : "s"}</p>
          <dl>
            <div><dt>Total booking price</dt><dd>{money(q.total)}</dd></div>
            <div className="bookingPayNow"><dt>Pay online now</dt><dd>{money(q.advance)}</dd></div>
            <div><dt>Pay at the club</dt><dd>{money(q.balance)}</dd></div>
          </dl>
        </div>
      )}
      {policy && (
        <>
          <details>
            <summary>Cancellation & date-change terms</summary>
            <p className="policy">{policy}</p>
          </details>
          <label className="check">
            <input type="checkbox" required />I accept the cancellation policy.
          </label>
        </>
      )}
      {!ready && (
        <p role="status">
          Online payments will open after the club finishes checkout setup.
        </p>
      )}
      <button className="gold" disabled={busy}>
        {busy ? "Opening checkout…" : "Continue to Razorpay"}
      </button>
      {error && <p role="alert">{error}</p>}
      {previous && /^\/pass\/[a-f0-9]{40}$/.test(previous) && (
        <p>
          <a href={previous}>View last booking status →</a>
        </p>
      )}
    </form>
  );
}
