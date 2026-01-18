import { useEffect, useRef } from "react";
import "./Parallax.css";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function Parallax({
  title = "Punk i Apart",
  subtitle = "NOU TEMA • EL GRUP • MÚSICA",
  videoSrc = "/hero.mp4",
}) {
  const elRef = useRef(null);
  const rafRef = useRef(0);

  // targets normalizados (-1..1)
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // flags
  const isTouchDeviceRef = useRef(false);
  const gyroEnabledRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    isTouchDeviceRef.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const applyParallax = () => {
      rafRef.current = 0;

      // suavizado (para gyro y drag)
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;

      const dx = currentRef.current.x;
      const dy = currentRef.current.y;

      const depth1 = `${50 + dx * -1.2}% ${50 + dy * -1.2}%`;
      const depth2 = `${50 + dx * -2.4}% ${50 + dy * -2.4}%`;
      const depth3 = `${50 + dx * -7.2}% ${50 + dy * -7.2}%`;

      el.style.backgroundPosition = `${depth3}, ${depth2}, ${depth1}`;
    };

    const schedule = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(applyParallax);
    };

    // ---------------- DESKTOP: mouse ----------------
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const onMouseMove = (e) => {
      const _w = window.innerWidth / 2;
      const _h = window.innerHeight / 2;
      targetRef.current.x = clamp((e.clientX - _w) / _w, -1, 1);
      targetRef.current.y = clamp((e.clientY - _h) / _h, -1, 1);
      schedule();
    };

    if (canHover) window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ---------------- MOBILE: gyro (deviceorientation) ----------------
    const onOrientation = (ev) => {
      // gamma: izq/der (-90..90) | beta: delante/detrás (-180..180)
      const gamma = ev.gamma ?? 0;
      const beta = ev.beta ?? 0;

      // normaliza a -1..1 (ajusta sensibilidad)
      const nx = clamp(gamma / 30, -1, 1);
      const ny = clamp(beta / 45, -1, 1);

      targetRef.current.x = nx;
      targetRef.current.y = ny;
      schedule();
    };

    const enableGyro = async () => {
      if (gyroEnabledRef.current) return;

      try {
        // iOS requiere permiso explícito
        if (
          typeof window.DeviceOrientationEvent !== "undefined" &&
          typeof window.DeviceOrientationEvent.requestPermission === "function"
        ) {
          const res = await window.DeviceOrientationEvent.requestPermission();
          if (res !== "granted") return;
        }

        window.addEventListener("deviceorientation", onOrientation, true);
        gyroEnabledRef.current = true;
      } catch {
        // si falla, nos quedamos con drag
      }
    };

    // En móviles: intentamos activar gyro con la primera interacción
    const onFirstUserGesture = () => {
      if (isTouchDeviceRef.current) enableGyro();
      el.removeEventListener("pointerdown", onFirstUserGesture);
    };

    el.addEventListener("pointerdown", onFirstUserGesture, { passive: true });

    // ---------------- MOBILE fallback: drag ----------------
    let touchActive = false;

    const onTouchStart = (e) => {
      touchActive = true;
      const t = e.touches?.[0];
      if (!t) return;
      const _w = window.innerWidth / 2;
      const _h = window.innerHeight / 2;
      targetRef.current.x = clamp((t.clientX - _w) / _w, -1, 1);
      targetRef.current.y = clamp((t.clientY - _h) / _h, -1, 1);
      schedule();
    };

    const onTouchMove = (e) => {
      if (!touchActive) return;
      const t = e.touches?.[0];
      if (!t) return;
      const _w = window.innerWidth / 2;
      const _h = window.innerHeight / 2;
      targetRef.current.x = clamp((t.clientX - _w) / _w, -1, 1);
      targetRef.current.y = clamp((t.clientY - _h) / _h, -1, 1);
      schedule();
    };

    const onTouchEnd = () => {
      touchActive = false;
      // vuelve al centro solo si NO hay gyro activo
      if (!gyroEnabledRef.current) {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
        schedule();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    // init
    schedule();

    return () => {
      if (canHover) window.removeEventListener("mousemove", onMouseMove);

      el.removeEventListener("pointerdown", onFirstUserGesture);

      window.removeEventListener("deviceorientation", onOrientation, true);

      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  return (
    <div className="parallax" ref={elRef}>
      {/* ✅ Video de fondo */}
      <video
        className="parallax__video"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />

      {/* Overlay pro */}
      <div className="parallax__overlay">
        <div className="parallax__badge">PUNK • LIVE</div>

        <h1 className="parallax__title">{title}</h1>

        {subtitle ? <p className="parallax__subtitle">{subtitle}</p> : null}

        <div className="parallax__cta">
          <a className="parallax__btn" href="#music">Escuchar</a>
          <a className="parallax__btn ghost" href="#about">Ver el grup</a>
        </div>

        <p className="parallax__hint">
          En móvil: mueve el móvil (si lo permite) o arrastra con el dedo
        </p>
      </div>
    </div>
  );
}
