import FullScreenMenu from "./components/FullScreenMenu/FullScreenMenu";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Music from "./components/Music/Music";

export default function App() {
  return (
    <>
      <FullScreenMenu brand="Punk i Apart" />
      <main>
        <Hero />

        <section id="about">
          <About />
        </section>

        <section id="music">
          <Music />
        </section>
      </main>
    </>
  );
}
