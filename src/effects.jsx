import React, {useEffect, useRef, useState} from "react";
import {motion, useMotionValue, useSpring, useTransform} from "framer-motion";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Respect the same accessibility preference the rest of the site honors.
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ================= DNA Helix ================= */
// A rotating double-helix built from SVG, animated with a CSS transform
// spin. No WebGL/Three.js dependency — much lighter and can't crash the
// build, but reads as a real 3D-style rotating model at hero size.
export function DnaHelix({size = 260}) {
  const rungs = Array.from({length: 10});
  return (
    <div className="dnaWrap" style={{width: size, height: size}}>
      <svg className="dnaSpin" viewBox="0 0 200 400" style={{width: "100%", height: "100%"}}>
        <defs>
          <linearGradient id="strandA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd7dc" />
            <stop offset="100%" stopColor="#ff8a95" />
          </linearGradient>
          <linearGradient id="strandB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffe3e6" />
          </linearGradient>
        </defs>
        {rungs.map((_, i) => {
          const y = 20 + i * 38;
          const phase = (i / rungs.length) * Math.PI * 2;
          const x1 = 100 + Math.sin(phase) * 70;
          const x2 = 100 - Math.sin(phase) * 70;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="#ffffff90" strokeWidth="2" />
              <circle cx={x1} cy={y} r="7" fill="url(#strandA)" />
              <circle cx={x2} cy={y} r="7" fill="url(#strandB)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================= Floating capsules ================= */
// A handful of pill/capsule SVGs that drift up and down independently.
export function FloatingCapsules({count = 5}) {
  const items = Array.from({length: count});
  return (
    <div className="capsuleField">
      {items.map((_, i) => (
        <motion.svg
          key={i}
          className="capsule"
          width="34" height="16" viewBox="0 0 34 16"
          style={{
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 26}%`,
          }}
          animate={prefersReducedMotion() ? {} : {y: [0, -22, 0], rotate: [0, 8, -4, 0]}}
          transition={{duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4}}
        >
          <rect x="0" y="0" width="34" height="16" rx="8" fill="#ffffff" opacity="0.9" />
          <path d="M17 0 A8 8 0 0 1 17 16 Z" fill="#c51f2b" />
        </motion.svg>
      ))}
    </div>
  );
}

/* ================= Cursor glow ================= */
// A soft red radial glow that follows the pointer — desktop only, and
// skipped entirely for touch devices / reduced-motion users.
export function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, {damping: 30, stiffness: 200});
  const sy = useSpring(y, {damping: 30, stiffness: 200});
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const move = e => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  if (prefersReducedMotion() || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)) return null;
  return <motion.div className="cursorGlow" style={{left: sx, top: sy}} />;
}

/* ================= Particle field ================= */
// Faint floating "molecule" dots drifting behind hero sections.
export function ParticleField({count = 18}) {
  const dots = useRef(
    Array.from({length: count}).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 3 + Math.random() * 5,
      dur: 8 + Math.random() * 10,
      delay: Math.random() * 6,
    }))
  ).current;
  return (
    <div className="particleField" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="particleDot"
          style={{
            left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size,
            animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ================= 3D tilt card ================= */
// Wraps children in a card that tilts toward the cursor in 3D and springs
// back on mouse-leave. Used for product cards.
export function TiltCard({children, className = "", ...rest}) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, {stiffness: 150, damping: 15});
  const sry = useSpring(ry, {stiffness: 150, damping: 15});
  function onMove(e) {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  }
  function onLeave() { rx.set(0); ry.set(0); }
  return (
    <motion.div
      ref={ref}
      className={`tiltCard ${className}`}
      style={{rotateX: srx, rotateY: sry, transformPerspective: 800}}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ================= Magnetic button ================= */
// Button nudges slightly toward the cursor while hovered.
export function Magnetic({children, className = "", as: Tag = "button", ...rest}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, {stiffness: 200, damping: 14});
  const sy = useSpring(y, {stiffness: 200, damping: 14});
  const MotionTag = motion[Tag] || motion.button;
  function onMove(e) {
    if (prefersReducedMotion()) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  }
  function onLeave() { x.set(0); y.set(0); }
  return (
    <MotionTag ref={ref} className={className} style={{x: sx, y: sy}} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      {children}
    </MotionTag>
  );
}

/* ================= Animated counter ================= */
// Counts up from 0 to `to` once it scrolls into view.
export function Counter({to, suffix = "", label}) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(el);
      if (prefersReducedMotion()) { setN(to); return; }
      let start = null;
      const dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        setN(Math.floor(p * to));
        if (p < 1) requestAnimationFrame(step); else setN(to);
      }
      requestAnimationFrame(step);
    }, {threshold: 0.4});
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return (
    <div className="counterCard" ref={ref}>
      <b>{n}{suffix}</b>
      <span>{label}</span>
    </div>
  );
}

/* ================= Research pipeline ================= */
// A horizontal stage tracker whose connecting line fills in as it
// scrolls into view, driven by GSAP ScrollTrigger.
export function ResearchPipeline({stages}) {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) { if (lineRef.current) lineRef.current.style.width = "100%"; return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        {width: "0%"},
        {
          width: "100%",
          ease: "none",
          scrollTrigger: {trigger: wrapRef.current, start: "top 75%", end: "bottom 60%", scrub: 0.6},
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);
  return (
    <div className="pipeline" ref={wrapRef}>
      <div className="pipelineTrack">
        <div className="pipelineLine" ref={lineRef}></div>
      </div>
      <div className="pipelineStages">
        {stages.map((s, i) => (
          <div className="pipelineStage" key={s}>
            <span className="pipelineDot"></span>
            <p>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
