import { useEffect, useRef } from "react";
import "./Parallax.css";

export default function Parallax() {
  const elRef = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onMove = (e) => {
      lastRef.current.x = e.clientX;
      lastRef.current.y = e.clientY;

      // Throttle con RAF (más suave y mejor rendimiento)
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;

        const _w = window.innerWidth / 2;
        const _h = window.innerHeight / 2;
        const _mouseX = lastRef.current.x;
        const _mouseY = lastRef.current.y;

        const depth1 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.01}%`;
        const depth2 = `${50 - (_mouseX - _w) * 0.02}% ${50 - (_mouseY - _h) * 0.02}%`;
        const depth3 = `${50 - (_mouseX - _w) * 0.06}% ${50 - (_mouseY - _h) * 0.06}%`;

        el.style.backgroundPosition = `${depth3}, ${depth2}, ${depth1}`;
      });
    };

    // Solo en dispositivos con puntero/ratón (evita trabajo inútil en móvil)
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (canHover) window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      if (canHover) window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  return (
    <section className="parallax" id="parallax" ref={elRef}>
      <h1 className="parallax__title">NOU TEMA</h1>
    </section>
  );
}
