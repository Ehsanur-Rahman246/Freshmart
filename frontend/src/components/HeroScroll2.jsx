import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight } from "react-icons/fi";

import CloudLeft from "/assets/cloud-1.png";
import CloudRight from "/assets/cloud-2.png";
import FrameFarms from "/assets/scroll-image-1.png";
import FrameDelivery from "/assets/scroll-image-2.png";
import DeliveryTruck from "/assets/truck.png";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_ITEMS = [
  "Lorem Ipsum",
  "Dolor Sit Amet",
  "Consectetur",
  "Adipiscing Elit",
  "Sed Do Eiusmod",
  "Tempor Incididunt",
];

export default function HeroScrollSecondary() {
  const wrapperRef = useRef(null);

  const cloudStageRef = useRef(null);
  const cloudLeftRef = useRef(null);
  const cloudRightRef = useRef(null);

  const farmsStageRef = useRef(null);
  const farmsImgRef = useRef(null);
  const bubble1Ref = useRef(null);
  const bubble2Ref = useRef(null);
  const farmsBtnRef = useRef(null);

  const deliveryStageRef = useRef(null);
  const truckRef = useRef(null);
  const deliveryTextRef = useRef(null);
  const deliveryBtnRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ---- 1. Clouds converge to cover the screen, then part ----
      gsap.set(cloudLeftRef.current, { xPercent: -120, opacity: 0 });
      gsap.set(cloudRightRef.current, { xPercent: 120, opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: cloudStageRef.current,
            start: "top top",
            end: "+=100%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        })
        .to([cloudLeftRef.current, cloudRightRef.current], {
          opacity: 1,
          duration: 0.25,
        })
        .to(cloudLeftRef.current, { xPercent: 0, duration: 0.4 }, "<")
        .to(cloudRightRef.current, { xPercent: 0, duration: 0.4 }, "<")
        .to({}, { duration: 0.2 }) // hold, fully covered
        .to(cloudLeftRef.current, {
          xPercent: -120,
          opacity: 0,
          duration: 0.4,
        })
        .to(
          cloudRightRef.current,
          { xPercent: 120, opacity: 0, duration: 0.4 },
          "<",
        );

      // ---- 2. Farms frame: bubble in -> image shifts -> bubble 2 + CTA ----
      gsap.set(bubble1Ref.current, { opacity: 0, y: 24 });
      gsap.set(bubble2Ref.current, { opacity: 0, y: 24 });
      gsap.set(farmsBtnRef.current, { opacity: 0, y: 16 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: farmsStageRef.current,
            start: "top top",
            end: "+=160%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        })
        .to(bubble1Ref.current, { opacity: 1, y: 0, duration: 0.3 })
        .to({}, { duration: 0.25 })
        .to(bubble1Ref.current, { opacity: 0, y: -16, duration: 0.25 })
        .to(
          farmsImgRef.current,
          { yPercent: -6, scale: 1.04, duration: 0.3 },
          "<",
        )
        .to(bubble2Ref.current, { opacity: 1, y: 0, duration: 0.3 })
        .to(farmsBtnRef.current, { opacity: 1, y: 0, duration: 0.25 }, "<0.1");

      // ---- 3. Delivery frame: truck left -> center (hold+CTA) -> right ----
      gsap.set(truckRef.current, { xPercent: -160 });
      gsap.set(deliveryTextRef.current, { opacity: 0, y: 16 });
      gsap.set(deliveryBtnRef.current, { opacity: 0, y: 16 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: deliveryStageRef.current,
            start: "top top",
            end: "+=170%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        })
        .to(truckRef.current, {
          xPercent: 0,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(deliveryTextRef.current, { opacity: 1, y: 0, duration: 0.25 })
        .to(
          deliveryBtnRef.current,
          { opacity: 1, y: 0, duration: 0.25 },
          "<0.1",
        )
        .to({}, { duration: 0.2 }) // hold at center
        .to(deliveryTextRef.current, { opacity: 0, y: -12, duration: 0.2 })
        .to(deliveryBtnRef.current, { opacity: 0, y: -12, duration: 0.2 }, "<")
        .to(
          truckRef.current,
          { xPercent: 160, duration: 0.4, ease: "power2.in" },
          "<",
        );

      ScrollTrigger.refresh();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full bg-base-100">
      {/* 1. Cloud transition */}
      <section
        ref={cloudStageRef}
        className="relative h-svh w-full overflow-hidden bg-base-200"
      >
        <img
          ref={cloudLeftRef}
          src={CloudLeft}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/3 w-[75%] max-w-3xl select-none"
          draggable={false}
        />
        <img
          ref={cloudRightRef}
          src={CloudRight}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 w-[75%] max-w-3xl select-none"
          draggable={false}
        />
      </section>

      {/* 2. Farms frame */}
      <section
        ref={farmsStageRef}
        className="relative h-svh w-full overflow-hidden"
      >
        <img
          ref={farmsImgRef}
          src={FrameFarms}
          alt="Local farms"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-base-content/70 via-base-content/10 to-transparent" />

        <div
          ref={bubble1Ref}
          className="absolute left-1/2 top-[16%] w-[min(26rem,85vw)] -translate-x-1/2 rounded-3xl border border-white/15 bg-base-content/55 px-6 py-5 text-center shadow-2xl backdrop-blur-md sm:left-[8%] sm:translate-x-0 sm:text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Lorem Ipsum
          </span>
          <p className="mt-2 text-lg font-bold text-base-100 sm:text-xl">
            Lorem ipsum dolor sit amet consectetur adipiscing elit.
          </p>
        </div>

        <div
          ref={bubble2Ref}
          className="absolute bottom-[14%] left-1/2 w-[min(28rem,85vw)] -translate-x-1/2 rounded-3xl border border-white/15 bg-base-content/55 px-6 py-5 text-center shadow-2xl backdrop-blur-md sm:left-auto sm:right-[8%] sm:translate-x-0 sm:text-left"
        >
          <p className="text-sm leading-relaxed text-base-100/90 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </p>
          <Link
            ref={farmsBtnRef}
            to="/farms"
            className="btn btn-primary btn-sm mt-4 gap-2 rounded-full"
          >
            Browse Farms <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* 3. Delivery frame + truck pass */}
      <section
        ref={deliveryStageRef}
        className="relative h-svh w-full overflow-hidden bg-base-300"
      >
        <img
          src={FrameDelivery}
          alt="Delivery zone"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-base-content/55 via-transparent to-base-content/65" />

        <div
          ref={deliveryTextRef}
          className="absolute inset-x-0 top-[14%] flex flex-col items-center gap-3 px-6 text-center"
        >
          <span className="rounded-full bg-primary/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-content">
            Lorem Ipsum
          </span>
          <h2 className="max-w-xl text-2xl font-extrabold text-base-100 sm:text-4xl">
            Lorem ipsum dolor sit amet consectetur adipiscing.
          </h2>
        </div>

        <img
          ref={truckRef}
          src={DeliveryTruck}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10%] left-1/2 w-[70vw] max-w-xl -translate-x-1/2 select-none drop-shadow-2xl sm:w-[46vw] md:w-[32vw]"
          draggable={false}
        />

        <Link
          ref={deliveryBtnRef}
          to="/marketplace"
          className="btn btn-secondary absolute bottom-[24%] left-1/2 -translate-x-1/2 gap-2 rounded-full sm:bottom-[28%]"
        >
          Browse Marketplace <FiArrowRight />
        </Link>
      </section>

      {/* 4. Infinite scroll strip */}
      <section className="overflow-hidden border-y border-theme-light bg-base-200 py-6">
        <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-10">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
