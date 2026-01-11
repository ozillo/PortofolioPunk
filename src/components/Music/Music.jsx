import { useEffect, useMemo, useRef, useState } from "react";
import { FaBackward, FaForward, FaPlay, FaPause } from "react-icons/fa";
import "./Music.css";

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec - m * 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function Music() {
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const seekWrapRef = useRef(null);

  const playlist = useMemo(
    () => [
      {
        album: "Me & You",
        track: "Alex Skrindo - Me & You",
        artwork: "https://singhimalaya.github.io/Codepen/assets/img/album-arts/1.jpg",
        url: "https://singhimalaya.github.io/Codepen/assets/music/1.mp3",
      },
      {
        album: "Dawn",
        track: "Skylike - Dawn",
        artwork: "https://singhimalaya.github.io/Codepen/assets/img/album-arts/2.jpg",
        url: "https://singhimalaya.github.io/Codepen/assets/music/2.mp3",
      },
      {
        album: "Electro Boy",
        track: "Kaaze - Electro Boy",
        artwork: "https://singhimalaya.github.io/Codepen/assets/img/album-arts/3.jpg",
        url: "https://singhimalaya.github.io/Codepen/assets/music/3.mp3",
      },
      {
        album: "Home",
        track: "Jordan Schor - Home",
        artwork: "https://singhimalaya.github.io/Codepen/assets/img/album-arts/4.jpg",
        url: "https://singhimalaya.github.io/Codepen/assets/music/4.mp3",
      },
      {
        album: "Proxy (Original Mix)",
        track: "Martin Garrix - Proxy",
        artwork: "https://singhimalaya.github.io/Codepen/assets/img/album-arts/5.jpg",
        url: "https://singhimalaya.github.io/Codepen/assets/music/5.mp3",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackActive, setTrackActive] = useState(false); // sube el track (active)
  const [trackTimeActive, setTrackTimeActive] = useState(false); // pinta tiempos (active)
  const [buffering, setBuffering] = useState(false);

  const [current, setCurrent] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progressPct, setProgressPct] = useState(0);

  const [hoverPct, setHoverPct] = useState(0);
  const [hoverTime, setHoverTime] = useState("00:00");
  const [hoverX, setHoverX] = useState(0);
  const [showHover, setShowHover] = useState(false);

  const currentItem = playlist[index];

  // Crea/actualiza audio source cuando cambia el track
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();

    const audio = audioRef.current;
    audio.src = currentItem.url;
    audio.loop = false;
    audio.preload = "auto";

    // Reset UI
    setProgressPct(0);
    setCurrent("00:00");
    setDuration("00:00");
    setTrackTimeActive(false);
    setBuffering(false);

    // Si estaba reproduciendo, sigue reproduciendo al cambiar (como codepen al Next/Prev)
    if (isPlaying) {
      // Añadimos la clase active al track + disco
      setTrackActive(true);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setTrackActive(false);
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listeners de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let rafId = null;
    let lastTimeMs = 0;

    const update = () => {
      const cur = audio.currentTime;
      const dur = audio.duration;

      setCurrent(formatTime(cur));
      setDuration(formatTime(dur));

      if (Number.isFinite(cur) && Number.isFinite(dur) && dur > 0) {
        setTrackTimeActive(true);
        setProgressPct((cur / dur) * 100);
      } else {
        setTrackTimeActive(false);
        setProgressPct(0);
      }

      rafId = requestAnimationFrame(update);
    };

    const onPlay = () => {
      setIsPlaying(true);
      setTrackActive(true);
      // arranca loop visual suave
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    const onPause = () => {
      setIsPlaying(false);
      setTrackActive(false);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      setBuffering(false);
    };

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);

    const onTimeUpdate = () => {
      // ayuda a “buffering” como en el pen (si pasa 1s sin avance)
      const now = Date.now();
      if (lastTimeMs === 0) lastTimeMs = now;
      // si el navegador no ha disparado playing/waiting en mobile, esta heurística ayuda
      if (now - lastTimeMs > 1200 && isPlaying) setBuffering(true);
      lastTimeMs = now;
    };

    const onEnded = () => {
      // comportamiento parecido al pen: vuelve a play icon y se queda en 00:00
      setIsPlaying(false);
      setTrackActive(false);
      setBuffering(false);
      setProgressPct(0);
      setCurrent("00:00");
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // pequeño delay como el pen (300ms)
    window.setTimeout(() => {
      if (audio.paused) {
        setTrackActive(true);
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        audio.pause();
      }
    }, 300);
  };

  const prev = () => setIndex((v) => Math.max(0, v - 1));
  const next = () => setIndex((v) => Math.min(playlist.length - 1, v + 1));

  // Seek hover + click
  const calcSeek = (clientX) => {
    const wrap = seekWrapRef.current;
    const audio = audioRef.current;
    if (!wrap || !audio) return null;

    const rect = wrap.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const pct = rect.width ? x / rect.width : 0;
    const seekTo = (audio.duration || 0) * pct;

    return { x, pct, seekTo, rectWidth: rect.width };
  };

  const onSeekMove = (e) => {
    const res = calcSeek(e.clientX);
    if (!res) return;

    setHoverPct(res.pct * 100);
    setHoverTime(formatTime(res.seekTo));
    setHoverX(res.x);
    setShowHover(true);
  };

  const onSeekLeave = () => {
    setHoverPct(0);
    setHoverTime("00:00");
    setHoverX(0);
    setShowHover(false);
  };

  const onSeekClick = (e) => {
    const audio = audioRef.current;
    const res = calcSeek(e.clientX);
    if (!audio || !res) return;
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = res.seekTo;
    setShowHover(false);
  };

  return (
    <section className="music" id="music" ref={rootRef}>
      {/* Background artwork + layer (como el pen) */}
      <div
        className="music__bg-artwork"
        style={{ backgroundImage: `url(${currentItem.artwork})` }}
        aria-hidden="true"
      />
      <div className="music__bg-layer" aria-hidden="true" />

      <div className="music__player-container">
        <div className="music__player">
          <div className={`music__player-track ${trackActive ? "active" : ""}`}>
            <div className="music__album-name">{currentItem.album}</div>
            <div className="music__track-name">{currentItem.track}</div>

            <div className={`music__track-time ${trackTimeActive ? "active" : ""}`}>
              <div className="music__current-time">{current}</div>
              <div className="music__track-length">{duration}</div>
            </div>

            <div
              className="music__seek-bar-container"
              ref={seekWrapRef}
              onMouseMove={onSeekMove}
              onMouseLeave={onSeekLeave}
              onClick={onSeekClick}
              role="slider"
              aria-label="Seek"
            >
              <div
                className="music__seek-time"
                style={{
                  display: showHover ? "block" : "none",
                  left: hoverX,
                  marginLeft: "-21px",
                }}
              >
                {hoverTime}
              </div>

              <div className="music__s-hover" style={{ width: `${hoverPct}%` }} />
              <div className="music__seek-bar" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="music__player-content">
            <div className={`music__album-art ${trackActive ? "active" : ""} ${buffering ? "buffering" : ""}`}>
              <img src={playlist[0].artwork} className={index === 0 ? "active" : ""} alt="" />
              <img src={playlist[1].artwork} className={index === 1 ? "active" : ""} alt="" />
              <img src={playlist[2].artwork} className={index === 2 ? "active" : ""} alt="" />
              <img src={playlist[3].artwork} className={index === 3 ? "active" : ""} alt="" />
              <img src={playlist[4].artwork} className={index === 4 ? "active" : ""} alt="" />
              <div className="music__buffer-box">Buffering ...</div>
            </div>

            <div className="music__player-controls">
              <div className="music__control">
                <button className="music__button" onClick={prev} aria-label="Previous">
                  <FaBackward />
                </button>
              </div>

              <div className="music__control">
                <button className="music__button" onClick={togglePlay} aria-label="Play/Pause">
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
              </div>

              <div className="music__control">
                <button className="music__button" onClick={next} aria-label="Next">
                  <FaForward />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
