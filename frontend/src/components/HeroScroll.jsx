import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";
import {
  FarmScene,
  FRAMES,
  CLOUD_LEFT,
  CLOUD_RIGHT,
  TRUCK,
} from "../three/farmScene";

gsap.registerPlugin(ScrollTrigger);

// --- SceneBubble ---------------------------------------------------------
// Outer wrapper handles LAYOUT only (flex alignment) — never a transform,
// so it never fights with GSAP, which owns the inner card's transform.

const LAYOUT = {
  left: "md:justify-start md:pl-[6%]",
  right: "md:justify-end md:pr-[6%]",
  center: "md:justify-center",
};

const TEXT_ALIGN = {
  left: "items-center text-center md:items-start md:text-left",
  right: "items-center text-center md:items-end md:text-right",
  center: "items-center text-center",
};

const SceneBubble = forwardRef(function SceneBubble(
  { eyebrow, title, body, align = "left", cta },
  ref,
) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-x-0 bottom-[6%] top-auto z-20 flex px-5",
        "md:inset-y-0 md:bottom-auto md:items-center md:px-0",
        LAYOUT[align] || LAYOUT.left,
      ].join(" ")}
    >
      <div
        ref={ref}
        className={[
          "flex w-full flex-col opacity-0",
          "md:w-[min(30rem,38vw)]",
          TEXT_ALIGN[align] || TEXT_ALIGN.left,
        ].join(" ")}
        style={{
          willChange: "transform, opacity",
          transform: "translateY(24px)",
        }}
      >
        <div className="pointer-events-auto rounded-3xl border border-white/15 bg-farm-ink/55 px-6 py-5 shadow-2xl backdrop-blur-md sm:px-8 sm:py-6">
          {eyebrow && (
            <span className="font-body text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-farm-gold">
              {eyebrow}
            </span>
          )}
          <h2 className="font-display mt-2 text-2xl leading-[1.1] text-farm-cream sm:text-3xl md:text-4xl">
            {title}
          </h2>
          {body && (
            <p className="font-body mt-3 text-sm leading-relaxed text-farm-cream/80 sm:text-base">
              {body}
            </p>
          )}
          {cta && (
            <button className="btn btn-sm mt-5 rounded-full border-none bg-farm-clay px-5 text-farm-cream hover:bg-farm-gold hover:text-farm-ink sm:btn-md">
              {cta}
              <FiArrowRight className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// --- Timeline "seconds" (arbitrary units — scrub maps them 0..1 against
// the scroll range, so only relative spacing matters) --------------------

const T = {
  cloudsEnd: 8,
  zoom1End: 16,
  bubble1In: 16,
  bubble1Out: 19,
  fade12Start: 20,
  fade12End: 30,
  bubble2In: 30,
  bubble2Out: 33,
  fade23Start: 34,
  fade23End: 46,
  truckInStart: 47,
  truckInEnd: 55,
  bubble3In: 55,
  bubble3Out: 58,
  truckOutStart: 59,
  truckOutEnd: 67,
  fade34Start: 67,
  fade34End: 81,
  bubble4In: 81,
  bubble4Out: 84,
  zoomOutStart: 85,
  zoomOutEnd: 97,
  fade45Start: 101,
  fade45End: 115,
  bubble5In: 117,
  end: 122,
};

const PX_PER_UNIT_DESKTOP = 90;
const PX_PER_UNIT_MOBILE = 62;

export default function HeroScroll() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const cloudLeftRef = useRef(null);
  const cloudRightRef = useRef(null);
  const truckRef = useRef(null);
  const scrollHintRef = useRef(null);
  const bubbleRefs = useRef([]);
  const sceneStateRef = useRef({ zoom: 1, camX: 0, op: [1, 0, 0, 0, 0] });
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const scene = new FarmScene(
      canvas,
      FRAMES.map((f) => f.src),
    );
    const state = sceneStateRef.current;

    const applyState = () => {
      scene.setCameraZoom(state.zoom);
      scene.setCameraX(state.camX);
      state.op.forEach((v, i) => scene.setOpacity(i, v));
      scene.update();
    };

    const handleResize = () => {
      const rect = stage.getBoundingClientRect();
      scene.setSize(rect.width, rect.height);
      applyState();
    };
    handleResize();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    const ro = new ResizeObserver(handleResize);
    ro.observe(stage);

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const pxPerUnit = isMobile ? PX_PER_UNIT_MOBILE : PX_PER_UNIT_DESKTOP;
    const scrollLength = T.end * pxPerUnit;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${scrollLength}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: applyState,
      });

      tl.to(scrollHintRef.current, { opacity: 0, duration: 4 }, 0);

      tl.to(
        cloudLeftRef.current,
        {
          xPercent: -130,
          opacity: 0.4,
          duration: T.cloudsEnd,
          ease: "power2.inOut",
        },
        0,
      );
      tl.to(
        cloudRightRef.current,
        {
          xPercent: 130,
          opacity: 0.4,
          duration: T.cloudsEnd,
          ease: "power2.inOut",
        },
        0,
      );

      tl.to(
        state,
        {
          zoom: 1.35,
          duration: T.zoom1End - T.cloudsEnd,
          ease: "power1.inOut",
        },
        T.cloudsEnd,
      );

      tl.to(
        bubbleRefs.current[0],
        {
          opacity: 1,
          y: 0,
          duration: T.bubble1Out - T.bubble1In,
          ease: "power2.out",
        },
        T.bubble1In,
      );

      tl.to(
        bubbleRefs.current[0],
        { opacity: 0, y: -16, duration: 3, ease: "power2.in" },
        T.fade12Start,
      );
      tl.to(
        state.op,
        { 0: 0, duration: T.fade12End - T.fade12Start, ease: "power1.inOut" },
        T.fade12Start,
      );
      tl.to(
        state.op,
        { 1: 1, duration: T.fade12End - T.fade12Start, ease: "power1.inOut" },
        T.fade12Start,
      );

      tl.to(
        bubbleRefs.current[1],
        {
          opacity: 1,
          y: 0,
          duration: T.bubble2Out - T.bubble2In,
          ease: "power2.out",
        },
        T.bubble2In,
      );

      tl.to(
        bubbleRefs.current[1],
        { opacity: 0, y: -16, duration: 3, ease: "power2.in" },
        T.fade23Start,
      );
      tl.to(
        state.op,
        { 1: 0, duration: T.fade23End - T.fade23Start, ease: "power1.inOut" },
        T.fade23Start,
      );
      tl.to(
        state.op,
        { 2: 1, duration: T.fade23End - T.fade23Start, ease: "power1.inOut" },
        T.fade23Start,
      );
      tl.to(
        state,
        {
          camX: "+=0.4",
          duration: T.fade23End - T.fade23Start,
          ease: "power1.inOut",
        },
        T.fade23Start,
      );

      tl.to(
        bubbleRefs.current[2],
        {
          opacity: 1,
          y: 0,
          duration: T.bubble3Out - T.bubble3In,
          ease: "power2.out",
        },
        T.bubble3In,
      );
      tl.to(
        bubbleRefs.current[2],
        { opacity: 0, y: -16, duration: 3, ease: "power2.in" },
        T.truckOutStart,
      );

      tl.to(
        state.op,
        { 2: 0, duration: T.fade34End - T.fade34Start, ease: "power1.inOut" },
        T.fade34Start,
      );
      tl.to(
        state.op,
        { 3: 1, duration: T.fade34End - T.fade34Start, ease: "power1.inOut" },
        T.fade34Start,
      );
      tl.to(
        state,
        {
          camX: "+=0.4",
          duration: T.fade34End - T.fade34Start,
          ease: "power1.inOut",
        },
        T.fade34Start,
      );
      tl.to(
        state,
        {
          zoom: 1.7,
          duration: T.fade34End - T.fade34Start,
          ease: "power1.inOut",
        },
        T.fade34Start,
      );

      tl.to(
        bubbleRefs.current[3],
        {
          opacity: 1,
          y: 0,
          duration: T.bubble4Out - T.bubble4In,
          ease: "power2.out",
        },
        T.bubble4In,
      );

      tl.to(
        bubbleRefs.current[3],
        { opacity: 0, y: -16, duration: 3, ease: "power2.in" },
        T.zoomOutStart,
      );
      tl.to(
        state,
        {
          zoom: 1.1,
          duration: T.zoomOutEnd - T.zoomOutStart,
          ease: "power1.inOut",
        },
        T.zoomOutStart,
      );

      tl.to(
        state.op,
        { 3: 0, duration: T.fade45End - T.fade45Start, ease: "power1.inOut" },
        T.fade45Start,
      );
      tl.to(
        state.op,
        { 4: 1, duration: T.fade45End - T.fade45Start, ease: "power1.inOut" },
        T.fade45Start,
      );
      tl.to(
        state,
        {
          camX: "+=0.4",
          duration: T.fade45End - T.fade45Start,
          ease: "power1.inOut",
        },
        T.fade45Start,
      );

      tl.to(
        bubbleRefs.current[4],
        { opacity: 1, y: 0, duration: T.end - T.bubble5In, ease: "power2.out" },
        T.bubble5In,
      );
    }, stage);

    gsap.set(truckRef.current, { xPercent: -160 });

    ScrollTrigger.create({
      trigger: stage,
      start: `top+=${T.truckInStart * pxPerUnit} top`,
      end: `top+=${T.truckOutEnd * pxPerUnit} top`,
      onEnter: () => {
        gsap.killTweensOf(truckRef.current);
        gsap.fromTo(
          truckRef.current,
          { xPercent: -160 },
          { xPercent: 0, duration: 1.1, ease: "power2.inOut" },
        );
      },
      onLeaveBack: () => {
        gsap.killTweensOf(truckRef.current);
        gsap.set(truckRef.current, { xPercent: -160 });
      },
    });

    ScrollTrigger.create({
      trigger: stage,
      start: `top+=${T.truckOutStart * pxPerUnit} top`,
      end: `top+=${T.truckOutEnd * pxPerUnit} top`,
      onEnter: () => {
        gsap.killTweensOf(truckRef.current);
        gsap.to(truckRef.current, {
          xPercent: 160,
          duration: 1.1,
          ease: "power2.inOut",
        });
      },
      onLeaveBack: () => {
        gsap.killTweensOf(truckRef.current);
        gsap.set(truckRef.current, { xPercent: 0 });
      },
    });

    return () => {
      ro.disconnect();
      ctx.revert();
      scene.dispose();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <section
        ref={stageRef}
        className="relative h-svh w-full overflow-hidden bg-farm-ink"
        aria-label="Fresh Mart — farm to your door"
        style={{ willChange: "transform" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {FRAMES.map((frame, i) => (
          <SceneBubble
            key={frame.id}
            ref={(el) => (bubbleRefs.current[i] = el)}
            eyebrow={frame.eyebrow}
            title={frame.title}
            body={frame.body}
            align={frame.align}
            cta={frame.cta}
          />
        ))}

        <img
          ref={truckRef}
          src={TRUCK}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10%] left-1/2 z-10 w-[70vw] max-w-xl -translate-x-1/2 select-none drop-shadow-2xl sm:w-[46vw] md:w-[32vw]"
          style={{ willChange: "transform" }}
          draggable={false}
        />

        <img
          ref={cloudLeftRef}
          src={CLOUD_LEFT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[10%] top-[-2%] z-30 h-[52%] w-[70%] select-none object-contain object-top-left"
          draggable={false}
        />
        <img
          ref={cloudRightRef}
          src={CLOUD_RIGHT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[10%] top-[-2%] z-30 h-[52%] w-[70%] select-none object-contain object-top-right"
          draggable={false}
        />

        <div className="pointer-events-none absolute left-5 top-5 z-40 flex items-center gap-2 sm:left-8 sm:top-8">
          <span className="font-display text-lg font-semibold text-farm-cream sm:text-xl">
            Fresh Mart
          </span>
        </div>

        <div
          ref={scrollHintRef}
          className="pointer-events-none absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1 text-farm-cream/70"
        >
          <span className="font-body text-[0.65rem] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <FiChevronDown className="animate-bounce" size={18} />
        </div>

        {!ready && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-farm-ink">
            <span className="loading loading-ring loading-lg text-farm-gold" />
          </div>
        )}
      </section>
    </div>
  );
}
