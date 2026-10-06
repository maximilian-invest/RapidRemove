"use client";
/* Bottom-Sheet am Handy nach unten wegwischen: am Griff jederzeit, sonst nur wenn der Inhalt ganz oben ist.
   Schließt ab ~110 px oder bei schnellem Wisch, sonst federt es zurück. Hintergrund blendet mit aus. */
import React from "react";

export default function useSwipeClose(ref, open, onClose) {
  const cb = React.useRef(onClose);
  cb.current = onClose;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    if (window.matchMedia("(min-width:821px)").matches) return;
    const bg = el.previousElementSibling && el.previousElementSibling.classList.contains("bg") ? el.previousElementSibling : null;
    let y0 = null, x0 = 0, dy = 0, t0 = 0, drag = false;
    const reset = () => { el.style.transition = ""; el.style.transform = ""; if (bg) { bg.style.transition = ""; bg.style.opacity = ""; } };
    const start = (e) => {
      if (e.touches.length !== 1) return;
      const onGrab = e.target.closest && e.target.closest(".grab,.ps-top");
      if (!onGrab && el.scrollTop > 0) return;
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = Date.now(); dy = 0; drag = false;
    };
    const move = (e) => {
      if (y0 == null) return;
      const d = e.touches[0].clientY - y0;
      if (!drag) {
        if (Math.abs(e.touches[0].clientX - x0) > Math.abs(d) + 4 || d < -4) { y0 = null; return; }
        if (d <= 6) return;
        drag = true; el.style.transition = "none"; if (bg) bg.style.transition = "none";
      }
      dy = Math.max(0, d - 6);
      if (e.cancelable) e.preventDefault();
      el.style.transform = `translateY(${dy}px)`;
      if (bg) bg.style.opacity = String(Math.max(0, 1 - dy / (el.offsetHeight || 600)));
    };
    const end = () => {
      if (y0 == null) return;
      y0 = null;
      if (!drag) return;
      drag = false;
      const v = dy / Math.max(1, Date.now() - t0);
      el.style.transition = ""; if (bg) bg.style.transition = "";
      if (dy > 110 || (v > 0.5 && dy > 30)) {
        el.style.transform = "translateY(105%)";
        if (bg) bg.style.opacity = "0";
        cb.current();
        setTimeout(reset, 520);
      } else {
        el.style.transform = ""; if (bg) bg.style.opacity = "";
      }
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      reset();
    };
  }, [ref, open]);
}
