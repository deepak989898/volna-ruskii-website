"use client";

import { useRef, useState } from "react";

export default function HeroVideo({ src, poster }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <video ref={video} className="heroBackdrop" aria-hidden="true"
        src={src} poster={poster} autoPlay muted loop playsInline preload="auto"
        onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => setFailed(true)} />
      {!playing && !failed && (
        <button className="heroPlay" type="button" aria-label="Play the club video"
          onClick={() => video.current?.play().catch(() => {})}>▶</button>
      )}
    </>
  );
}
