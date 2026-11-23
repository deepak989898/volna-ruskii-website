import Panel from "./Panel";
export const metadata = {
  title: "Staff desk",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return (
    <main className="admin sheet">
      <p className="eyebrow">VOLNA · STAFF ACCESS</p>
      <h1>Club desk</h1>
      <Panel apiKey={process.env.FIREBASE_WEB_API_KEY || ""} />
    </main>
  );
}
