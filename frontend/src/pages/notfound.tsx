import { useEffect, useRef } from "react";
import "../styles/notfound.css"; // Import the custom keyframes, pseudo‐elements, etc.

const STAR_COUNT = 100;

export default function NotFound() {
  // 1) Tell TypeScript that this ref will hold an HTMLDivElement (or null initially):
  const starsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = starsContainerRef.current;
    if (!container) return; // If the ref hasn't attached yet, bail out.

    // Clear out any existing stars (in case of re-render).
    container.innerHTML = "";

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement("div");

      // 2) Assign Tailwind + custom‐animation classes to each star:
      star.className =
        "absolute bg-white rounded-full opacity-80 animate-twinkle w-[2px] h-[2px]";
      // 3) Randomize position:
      star.style.top = Math.random() * 100 + "%";
      star.style.left = Math.random() * 100 + "%";
      // 4) Randomize the duration of the twinkle animation (1s to 3s):
      star.style.animationDuration = 1 + Math.random() * 2 + "s";

      container.appendChild(star);
    }
  }, []);

  return (
    <div
      className="
        relative
        w-full
        h-screen
        overflow-hidden
        bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]
        font-sans
        text-white
      "
    >
      {/* 1. Stars container (fills entire screen, sits behind everything else) */}
      <div ref={starsContainerRef} className="absolute inset-0 z-0"></div>

      {/* 2. Moon (styles + pseudo‐elements defined in NotFound.css) */}
      <div className="moon"></div>

      {/* 3. Main content (ghost + text + button) */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Ghost */}
        <div className="ghost-wrapper">
          <div className="ghost-body">
            <div className="ghost-eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
          </div>
          <div className="ghost-waves">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
        </div>

        {/* “404” heading */}
        <h1 className="notfound-heading text-[4rem] text-[#ff5e5e] mb-2">
          404
        </h1>

        {/* Subtext */}
        <p className="notfound-paragraph text-xl mb-4">
          You seem to be lost in the void…
        </p>

        {/* “Take me home” link */}
        <a
          href="/"
          className="
            bg-[#ff5e5e]
            text-white
            px-6 py-3
            rounded-lg
            hover:bg-[#ff3e3e]
            transition-colors
          "
        >
          Take me home
        </a>
      </div>
    </div>
  );
}
