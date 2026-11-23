export class InputError extends Error {}
export function requireValue(ok, message) {
  if (!ok) throw new InputError(message);
}
export function textValue(value, max, required = false) {
  requireValue(
    typeof value === "string" &&
      value.length <= max &&
      (!required || value.trim()),
    "Check the text fields and their lengths.",
  );
  return value.trim();
}
function integer(n, max, label, min = 1) {
  requireValue(
    Number.isSafeInteger(n) && n >= min && n <= max,
    "Invalid " + label + ".",
  );
  return n;
}
export function deskUpdate(b, action, amount) {
  requireValue(
    b.status === "confirmed",
    "Only confirmed bookings can be updated.",
  );
  const entered = b.entered ?? 0,
    exited = b.exited ?? 0,
    collected = b.collected ?? 0;
  switch (action) {
    case "enter":
      return {
        entered: entered + integer(amount, b.guests - entered, "arrival count"),
      };
    case "exit":
      return {
        exited: exited + integer(amount, entered - exited, "departure count"),
      };
    case "collect":
      requireValue(
        Number.isFinite(amount) &&
          amount > 0 &&
          Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001,
        "Enter a positive amount in rupees.",
      );
      {
        const next = Math.round((collected + amount) * 100) / 100;
        requireValue(
          next <= b.balance,
          "Collection exceeds the outstanding balance.",
        );
        return { collected: next };
      }
    default:
      throw new InputError("Unknown desk action.");
  }
}
export function packageValues(raw) {
  const id = textValue(raw.id, 48, true);
  requireValue(/^[a-z0-9][a-z0-9-]*$/.test(id), "Invalid package ID.");
  const name = textValue(raw.name, 80, true),
    description = textValue(raw.description, 350),
    price = integer(raw.price, 1000000, "price");
  const guests = integer(raw.guests, 100, "guests per unit"),
    advancePercent = integer(raw.advancePercent, 100, "advance percentage");
  requireValue(
    ["guest", "table"].includes(raw.unit) &&
      (raw.unit !== "guest" || guests === 1),
    "Individual entries must cover one guest.",
  );
  return {
    id,
    name,
    description,
    price,
    guests,
    advancePercent,
    unit: raw.unit,
    action: "Book " + name,
  };
}
