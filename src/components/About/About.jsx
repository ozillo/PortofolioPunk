import { useEffect, useRef } from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import "./About.css";

gsap.registerPlugin(SplitText);

export default function About() {
  const rootRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const profileImagesContainer = root.querySelector(".profile-images");
      const profileImages = root.querySelectorAll(".profile-images .img");
      const nameElements = root.querySelectorAll(".profile-names .name");
      const nameHeadings = root.querySelectorAll(".profile-names .name h1");

      // SplitText EXACTO
      const splits = [];
      nameHeadings.forEach((heading) => {
        const split = new SplitText(heading, { type: "chars" });
        split.chars.forEach((char) => char.classList.add("letter"));
        splits.push(split);
      });

      // Default "El grup" entra/sale al hover de la fila
      const defaultLetters = nameElements[0].querySelectorAll(".letter");
      gsap.set(defaultLetters, { y: "100%" });

      // ✅ Asegura estado inicial de TODOS los nombres (evita que en build se queden “fuera”)
      for (let i = 1; i < nameElements.length; i++) {
        const letters = nameElements[i].querySelectorAll(".letter");
        gsap.set(letters, { y: "0%" });
      }

      if (window.innerWidth >= 900) {
        const cleanups = [];

        profileImages.forEach((img, index) => {
          const correspondingName = nameElements[index + 1];
          const letters = correspondingName.querySelectorAll(".letter");

          const onEnter = () => {
            gsap.to(img, {
              width: 140,
              height: 140,
              duration: 0.5,
              ease: "power4.out",
            });

            gsap.to(letters, {
              y: "-100%",
              ease: "power4.out",
              duration: 0.75,
              stagger: { each: 0.025, from: "center" },
            });
          };

          const onLeave = () => {
            gsap.to(img, {
              width: 70,
              height: 70,
              duration: 0.5,
              ease: "power4.out",
            });

            gsap.to(letters, {
              y: "0%",
              ease: "power4.out",
              duration: 0.75,
              stagger: { each: 0.025, from: "center" },
            });
          };

          img.addEventListener("mouseenter", onEnter);
          img.addEventListener("mouseleave", onLeave);

          cleanups.push(() => {
            img.removeEventListener("mouseenter", onEnter);
            img.removeEventListener("mouseleave", onLeave);
          });
        });

        const onContainerEnter = () => {
          gsap.to(defaultLetters, {
            y: "0%",
            ease: "power4.out",
            duration: 0.75,
            stagger: { each: 0.025, from: "center" },
          });
        };

        const onContainerLeave = () => {
          gsap.to(defaultLetters, {
            y: "100%",
            ease: "power4.out",
            duration: 0.75,
            stagger: { each: 0.025, from: "center" },
          });
        };

        profileImagesContainer.addEventListener("mouseenter", onContainerEnter);
        profileImagesContainer.addEventListener("mouseleave", onContainerLeave);

        cleanups.push(() => {
          profileImagesContainer.removeEventListener("mouseenter", onContainerEnter);
          profileImagesContainer.removeEventListener("mouseleave", onContainerLeave);
        });

        return () => {
          cleanups.forEach((fn) => fn());
          splits.forEach((s) => s.revert());
        };
      }

      return () => {
        splits.forEach((s) => s.revert());
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="team" ref={rootRef} id="about">
      <div className="profile-images">
        <div className="img"><img src={`${base}img10.jpg`} alt="" /></div>
        <div className="img"><img src={`${base}img11.jpg`} alt="" /></div>
        <div className="img"><img src={`${base}img12.jpg`} alt="" /></div>
        <div className="img"><img src={`${base}img13.jpg`} alt="" /></div>
      </div>

      <div className="profile-names">
        <div className="name default"><h1>El grup</h1></div>
        <div className="name"><h1>Pol</h1></div>
        <div className="name"><h1>Julen</h1></div>
        <div className="name"><h1>Masip</h1></div>
        <div className="name"><h1>Jordi</h1></div>
      </div>
    </section>
  );
}
