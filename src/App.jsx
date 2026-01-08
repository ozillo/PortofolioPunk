import FullScreenMenu from "./components/FullScreenMenu/FullScreenMenu";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";

export default function App() {
  return (
    <>
      <FullScreenMenu brand="Punk i Apart" />
      <main>
        <Hero />
        <section id="about">
          <About />
        </section>
      </main>
    </>
  );
}
