import { useEffect, useMemo, useRef } from "react";
import SplitType from "split-type";
import "./Header.css";

export default function Header() {
  const menuContainerRef = useRef(null);
  const menuItemsRef = useRef([]);
  const splitInstancesRef = useRef([]);

  const items = useMemo(
    () => [
      { label: "HERO", meta: "go now", href: "#hero" },
      { label: "ABOUT", meta: "read", href: "#about" },
    ],
    []
  );

  // ---------- Helpers (ZIP behavior) ----------
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
          char.textContent = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }, shuffleInterval);

        setTimeout(() => {
          clearInterval(interval);
          char.textContent = originalText[index];
        }, resetDelay + index * additionalDelay);
      }, index * shuffleInterval);
    });
  };

  const shuffleAll = () => {
    // shuffle de todos los links y metas
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

  // ---------- SplitType + medidas bg-hover ----------
  useEffect(() => {
    // Limpia splits anteriores si HMR
    splitInstancesRef.current.forEach((s) => s?.revert?.());
    splitInstancesRef.current = [];

    // Split links + spans (como el ZIP)
    const linkSplit = new SplitType(".menu-item a", { types: "words, chars" });
    const spanSplit = new SplitType(".menu-item span", { types: "words, chars" });

    splitInstancesRef.current.push(linkSplit, spanSplit);

    // Calcula ancho de bg-hover y posición del span según el ancho del link
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

        // Hover de color chars (como ZIP)
        const chars = item.querySelectorAll("span .char");
        linkEl.addEventListener("mouseenter", () => colorChars(chars));
        linkEl.addEventListener("mouseleave", () => clearColorChars(chars));
      });

      // Hover shuffle en links y spans
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
  }, [items]);

  // ---------- Open / Close ----------
  const openMenu = () => {
    const el = menuContainerRef.current;
    if (!el) return;
    el.style.left = "0%";
    shuffleAll();
    animateMenuItems("in");
  };

  const closeMenu = () => {
    const el = menuContainerRef.current;
    if (!el) return;
    el.style.left = "-100%";
    animateMenuItems("out");
  };

  const onGo = () => {
    // cierra al click (como UX normal)
    closeMenu();
  };

  return (
    <>
      <nav className="kp-nav">
        <button className="menu-toggle" onClick={openMenu} aria-label="Open menu">
          <p>Menu</p>
        </button>

        <p className="nav-title">Punk i Apart</p>
      </nav>

      <div className="kp-container">
        <div className="menu-container" ref={menuContainerRef}>
          <div className="menu">
            <div className="menu-main">
              <div className="menu-top">
                <div className="menu-top-title">
                  <p>discover</p>
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
                        <a href={it.href} onClick={onGo}>
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
                  <div className="menu-title"><p>©</p></div>
                  <div className="menu-content"><p>{new Date().getFullYear()} Punk i Apart</p></div>
                </div>
              </div>
            </div>

            <div className="menu-sidebar">
              <button className="close-btn" onClick={closeMenu} aria-label="Close menu">
                ✕
              </button>
              <div className="logo">PA</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
