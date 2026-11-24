import Link from "next/link";

export const metadata = {
  title: "About Us | Volna Ruskii in Arpora, Goa",
  description: "Get to know VOLNA Russian Night Club, formerly Club Ruskii, in Arpora, Goa. Explore live performances, club entry and VIP table booking.",
};

export default function About() {
  return (
    <main className="sheet venuePage">
      <p className="eyebrow">ARPORA · GOA</p>
      <h1>About VOLNA Russian Night Club</h1>
      <section className="venueCard">
        <h2>Live performances and nightlife in Arpora</h2>
        <p>VOLNA, formerly Club Ruskii, is a nightclub on Calangute–Anjuna Road in Arpora, Goa. The venue features live stage performances, music and a dance floor.</p>
        <p>See the stage and club interiors in our <Link href="/gallery">photo gallery</Link>.</p>
        <h2>Club entry and VIP tables</h2>
        <p>Choose individual club entry or book a VIP table for up to six guests. You can review the package price and payment breakdown before choosing your visit date.</p>
        <div className="links">
          <Link className="gold" href="/#packages">View entry &amp; VIP packages</Link>
          <Link href="/contact">Find us &amp; contact</Link>
        </div>
      </section>
    </main>
  );
}
