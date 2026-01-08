import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <span className="logo">Punk i Apart</span>

        <nav className="nav">
          <a href="#hero">Inici</a>
          <a href="#about">El grup</a>
          <a href="#contact">Contacte</a>
        </nav>
      </div>
    </header>
  );
}
