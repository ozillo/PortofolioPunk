import { useEffect } from "react";

export default function BurgerMenu({ open, onClose }) {
  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ✅ IMPORTANTE:
  // Hemos QUITADO el bloqueo del scroll del body para que en mobile puedas bajar
  // (antes: document.body.style.overflow = "hidden")

  return (
    <div className={`mobile-overlay ${open ? "open" : ""}`}>
      {/* Click fuera para cerrar */}
      <button
        className="overlay-bg"
        onClick={onClose}
        aria-label="Tancar menú"
      />

      <div className="mobile-panel">
        <button className="close" onClick={onClose} aria-label="Tancar">
          ×
        </button>

        <nav className="mobile-nav">
          <a href="#hero" onClick={onClose}>Inici</a>
          <a href="#about" onClick={onClose}>El grup</a>
          <a href="#contact" onClick={onClose}>Contacte</a>
        </nav>

        <div className="mobile-footer">
          © {new Date().getFullYear()} Punk i Apart
        </div>
      </div>
    </div>
  );
}
