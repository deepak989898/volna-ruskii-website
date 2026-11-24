import Link from "next/link";

export const metadata = { title: "Club photo gallery" };
const photos = [
  "show-gold.webp",
  "dj.webp",
  "show-green.webp",
  "show-stage.webp",
  "hookah.webp",
  "show-pink.webp",
  "club-06.webp",
  "club-08.webp",
  "club-09.webp",
  "club-10.webp",
  "club-11.webp",
  "club-13.webp",
  "club-14.webp",
  "club-15.webp",
  "club-16.webp",
  "club-17.webp",
  "club-18.webp",
  "club-19.webp",
  "club-20.webp",
  "club-21.webp",
  "club-22.webp",
  "club-23.webp",
  "club-24.webp",
  "bsg-01.webp",
  "bsg-02.webp",
  "bsg-03.webp",
  "bsg-04.webp",
  "bsg-05.webp",
  "bsg-06.webp",
  "bsg-07.webp",
  "bsg-08.webp",
  "bsg-09.webp",
  "bsg-10.webp",
  "bsg-11.webp",
  "bsg-12.webp"
];

export default function Gallery() {
  return (
    <main className="packages">
      <h1>Inside VOLNA</h1>
      <p>Photos from the club in Arpora, Goa.</p>
      <div className="venueGalleryGrid">
        {photos.map((file, index) => (
          <img key={file} src={`/gallery/${file}`} alt={`VOLNA Russian Night Club photo ${index + 1}`} loading="lazy" decoding="async" />
        ))}
      </div>
      <Link className="gold" href="/#packages">Explore entry &amp; VIP packages</Link>
    </main>
  );
}
