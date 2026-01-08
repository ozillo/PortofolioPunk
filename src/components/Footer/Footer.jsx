import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} <strong>Punk i Apart</strong>. Tots els drets
        reservats.
      </p>
    </footer>
  );
}
