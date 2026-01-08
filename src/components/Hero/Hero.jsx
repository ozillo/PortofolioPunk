import Lanyard from "../Lanyard/Lanyard";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      {/* Lanyard tal cual, ocupando todo el Hero */}
      <div className="hero-lanyard">
        <Lanyard />
      </div>

      {/* (Opcional) Si NO quieres texto/overlay, borra este bloque */}
      {/* <div className="hero-overlay">
        <h1>Tu título</h1>
        <p>Tu subtítulo</p>
      </div> */}
    </section>
  );
}
