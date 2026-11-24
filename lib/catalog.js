export const packages = [
  {
    id: "entry",
    name: "Club Entry",
    price: 2000,
    guests: 1,
    unit: "guest",
    description: "Individual admission to the live show.",
    action: "Book Entry",
  },
  {
    id: "vip",
    name: "VIP Table",
    price: 30000,
    guests: 6,
    unit: "table",
    description: "One table booking covers six guests.",
    action: "Book VIP Table",
  },
];
export const money = (value) => "₹" + value.toLocaleString("en-IN");
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function quote(id, qty, catalog = packages) {
  const item = catalog.find((p) => p.id === id);
  if (!item || !Number.isSafeInteger(qty) || qty < 1 || qty > 50)
    throw Error("Invalid package or quantity.");
  const subtotal = item.price * qty;
  const guestCount = item.guests * qty;
  const discountPerGuest = id === "entry" && item.unit === "guest" && guestCount <= 10
    ? Math.min(item.price, guestCount >= 4 ? 500 : 200)
    : 0;
  const discount = Math.round(discountPerGuest * guestCount * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;
  const advance = Math.round(total * (item.advancePercent ?? 50)) / 100;
  return {
    packageId: id,
    packageName: item.name,
    qty,
    guests: item.guests * qty,
    subtotal,
    discount,
    discountPerGuest,
    total,
    advance,
    balance: Math.round((total - advance) * 100) / 100,
  };
}
