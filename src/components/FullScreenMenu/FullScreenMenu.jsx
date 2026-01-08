import { useEffect, useMemo, useRef, useState } from "react";
import SplitType from "split-type";
import "./FullScreenMenu.css";

export default function FullScreenMenu({
  brand = "Punk i Apart",
  items: itemsProp,
}) {
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const splitInstancesRef = useRef([]);
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      itemsProp ?? [
        { label: "HERO", meta: "go now", href: "#hero" },
        { label: "ABOUT", meta: "read", href: "#about" },
      ],
    [itemsProp]
  );

  /* ---------------- Split + hover ---------------- */
  useEffect(() => {
    if (!open) return;

    splitInstancesRef.current.forEach((s) => s?.revert?.());
    splitInstancesRef.current = [];

    const linkSplit = new SplitType(".fs-menu .menu-item a", {
      types: "words, chars",
    });
    const spanSplit = new SplitType(".fs-menu .menu-item span", {
      types: "words, chars",
    });

    splitInstancesRef.current.push(linkSplit, spanSplit);

    const raf = requestAnimationFrame(() => {
      menuItemsRef.current.forEach((item) => {
        if (!item) return;

        item.style.transform = "translateX(0)";
        item.style.opacity = "1";

        const link = item.querySelector("a");
        const bg = item.querySelector(".bg-hover");
        const span = item.querySelector("span");

        if (!link || !bg) return;

        bg.style.width = link.offsetWidth + 30 + "px";
        if (span) span.style.left = link.offsetWidth + 40 + "px";
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      splitInstancesRef.current.forEach((s) => s?.revert?.());
      splitInstancesRef.current = [];
    };
  }, [open]);

  /* ---------------- Open / Close ---------------- */
  const openMenu = () => setOpen(true);

  const closeMenu = () => {
    if (!menuRef.current) return;
    menuRef.current.classList.add("closing");

    setTimeout(() => {
      menuRef.current.classList.remove("closing");
      setOpen(false);
    }, 300); // ⏱ mismo tiempo que el CSS
  };

  /* ---------------- Close on scroll ---------------- */
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
  }, [open]);

  /* ---------------- ESC ---------------- */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* HEADER */}
      <nav className="kp-nav">
        <button className="menu-toggle" onClick={openMenu}>
          Menu
        </button>
        <p className="nav-title">{brand}</p>
      </nav>

      {/* FULLSCREEN MENU */}
      {open && (
        <div
          ref={menuRef}
          className="fs-menu open"
          onClick={closeMenu}
        >
          {/* parar cierre dentro */}
          <div className="menu" onClick={(e) => e.stopPropagation()}>
            <div className="menu-main">
              <div className="menu-top">
                <div className="menu-top-title">
                  <p>discover</p>
                </div>

                <div className="menu-top-content">
                  {items.map((it, i) => (
                    <div
                      key={it.label}
                      className="menu-item"
                      ref={(el) => (menuItemsRef.current[i] = el)}
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
                <p>© {new Date().getFullYear()} {brand}</p>
              </div>
            </div>

            <div className="menu-sidebar">
              <button className="close-btn" onClick={closeMenu}>
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
