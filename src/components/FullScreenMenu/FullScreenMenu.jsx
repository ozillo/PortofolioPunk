import { useEffect, useMemo, useRef, useState } from "react";
import SplitType from "split-type";
import "./FullScreenMenu.css";

export default function FullScreenMenu({
  brand = "Punk i Apart",
  items: itemsProp,
}) {
  const menuItemsRef = useRef([]);
  const splitInstancesRef = useRef([]);
  const closeTimerRef = useRef(null);

  // Bloqueo scroll pro
  const prevOverflowRef = useRef("");
  const prevPaddingRightRef = useRef("");

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const items = useMemo(
    () =>
      itemsProp ?? [
        { label: "NOU TEMA", meta: "gaudeix", href: "#hero" },
        { label: "EL GRUP", meta: "veure", href: "#about" },
        { label: "MÚSICA", meta: "escolta", href: "#music" },
      ],
    [itemsProp]
  );

  /* ---------- Helpers ---------- */
  const animateMenuItems = (direction = "in") => {
    menuItemsRef.current.forEach((item, index) => {
      if (!item) return;
      setTimeout(() => {
        item.style.left = direction === "in" ? "0px" : "-100px";
      }, index * 50);
    });
  };

  const addShuffleEffect = (element) => {
    if (!element) return;
    const chars = element.querySelectorAll(".char");
    if (!chars.length) return;

    const originalText = [...chars].map((c) => c.textContent);
    const shuffleInterval = 10;
    const resetDelay = 75;
    const additionalDelay = 150;

    chars.forEach((char, index) => {
      setTimeout(() => {
        const interval = setInterval(() => {
          char.textContent = String.fromCharCode(
            97 + Math.floor(Math.random() * 26)
          );
        }, shuffleInterval);

        setTimeout(() => {
          clearInterval(interval);
          char.textContent = originalText[index];
        }, resetDelay + index * additionalDelay);
      }, index * shuffleInterval);
    });
  };

  const shuffleAll = () => {
    menuItemsRef.current.forEach((item) => {
      if (!item) return;
      const a = item.querySelector(".menu-item-link a");
      const span = item.querySelector("span");
      addShuffleEffect(a);
      addShuffleEffect(span);
    });
  };

  const colorChars = (chars) => {
    chars.forEach((char, index) => {
      setTimeout(() => char.classList.add("char-active"), index * 50);
    });
  };

  const clearColorChars = (chars) => {
    chars.forEach((char) => char.classList.remove("char-active"));
  };

  /* ---------- TOQUE PRO: bloquear scroll mientras open ---------- */
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    prevOverflowRef.current = body.style.overflow;
    prevPaddingRightRef.current = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = prevOverflowRef.current || "";
      body.style.paddingRight = prevPaddingRightRef.current || "";
    };
  }, [open]);

  /* ---------- SplitType (solo cuando está abierto) ---------- */
  useEffect(() => {
    if (!open) return;

    splitInstancesRef.current.forEach((s) => s?.revert?.());
    splitInstancesRef.current = [];

    const linkSplit = new SplitType(".menu-item a", { types: "words, chars" });
    const spanSplit = new SplitType(".menu-item span", { types: "words, chars" });
    splitInstancesRef.current.push(linkSplit, spanSplit);

    const raf = requestAnimationFrame(() => {
      menuItemsRef.current.forEach((item) => {
        if (!item) return;

        const linkEl = item.querySelector(".menu-item-link a");
        const bg = item.querySelector(".menu-item-link .bg-hover");
        const spanEl = item.querySelector("span");

        if (!linkEl || !bg) return;

        const width = linkEl.offsetWidth;
        bg.style.width = width + 30 + "px";
        if (spanEl) spanEl.style.left = width + 40 + "px";

        const chars = item.querySelectorAll("span .char");
        linkEl.addEventListener("mouseenter", () => colorChars(chars));
        linkEl.addEventListener("mouseleave", () => clearColorChars(chars));
      });

      menuItemsRef.current.forEach((item) => {
        if (!item) return;
        item.addEventListener("mouseenter", () => {
          const a = item.querySelector(".menu-item-link a");
          const span = item.querySelector("span");
          addShuffleEffect(a);
          addShuffleEffect(span);
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      splitInstancesRef.current.forEach((s) => s?.revert?.());
      splitInstancesRef.current = [];
    };
  }, [open, items]);

  /* ---------- Open / Close (fade con tu CSS) ---------- */
  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosing(false);
    setOpen(true);

    requestAnimationFrame(() => {
      shuffleAll();
      animateMenuItems("in");
    });
  };

  const closeMenu = () => {
    if (!open || closing) return;

    setClosing(true);
    animateMenuItems("out");

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 300);
  };

  /* ---------- Cerrar al hacer scroll / wheel / touchmove ---------- */
  useEffect(() => {
    if (!open) return;

    const close = () => closeMenu();
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("wheel", close, { passive: true });
    window.addEventListener("touchmove", close, { passive: true });

    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("wheel", close);
      window.removeEventListener("touchmove", close);
    };
  }, [open, closing]);

  /* ---------- ESC ---------- */
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closing]);

  /* ---------- Cleanup ---------- */
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      splitInstancesRef.current.forEach((s) => s?.revert?.());
      splitInstancesRef.current = [];
    };
  }, []);

  return (
    <>
      <nav className="kp-nav">
        <button className="menu-toggle" onClick={openMenu} aria-label="Open menu">
          <p>Menu</p>
        </button>
        <p className="nav-title">{brand}</p>
      </nav>

      {open && (
        <div className={`fs-menu open ${closing ? "closing" : ""}`}>
          {/* ✅ ESTO ES EL “FUERA” CLICKABLE */}
          <button
            className="fs-backdrop"
            onClick={closeMenu}
            aria-label="Close menu"
          />

          {/* ✅ ESTO ES EL PANEL (no ocupa toda la pantalla) */}
          <div className="menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-main">
              <div className="menu-top">
                <div className="menu-top-title">
                
                </div>

                <div className="menu-top-content">
                  {items.map((it, idx) => (
                    <div
                      className="menu-item"
                      key={it.label}
                      ref={(node) => (menuItemsRef.current[idx] = node)}
                    >
                      <div className="menu-item-link">
                        <div className="bg-hover" />
                        <a href={it.href} onClick={closeMenu}>
                          {it.label}
                        </a>
                      </div>
                      <span>{it.meta}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="menu-bottom">
                <div className="menu-sub-item">
                  <div className="menu-title">
                    <p>©</p>
                  </div>
                  <div className="menu-content">
                    <p>
                      {new Date().getFullYear()} {brand}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="menu-sidebar">
              <button
                className="close-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                ✕
              </button>
              <div className="logo">PA</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
