"use client";

import Link from "next/link";
import { useRef } from "react";

const links = [
  ["/#packages", "Packages"],
  ["/gallery", "Gallery"],
  ["/about", "About Us"],
  ["/contact", "Find us"],
];

export default function SiteMenu() {
  const drawer = useRef(null);
  const close = () => drawer.current?.close();

  return (
    <>
      <nav className="desktopSiteMenu" aria-label="Main navigation">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <button className="siteMenuToggle" type="button" aria-label="Open menu"
        aria-haspopup="dialog" onClick={() => drawer.current?.showModal()}>☰</button>
      <dialog className="siteMenuDrawer" aria-label="Main menu" ref={drawer}
        onClick={(event) => {
          if (event.target === drawer.current &&
            event.clientX < drawer.current.getBoundingClientRect().left) close();
        }}>
        <button className="siteMenuToggle" type="button" aria-label="Close menu" onClick={close}>×</button>
        <nav aria-label="Mobile navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={close}>{label}</Link>
          ))}
        </nav>
      </dialog>
    </>
  );
}
