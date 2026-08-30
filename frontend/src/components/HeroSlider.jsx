import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import Banner1 from "../assets/dash1.jpg"
import Banner2 from "../assets/dash2.jpg"
import Banner3 from "../assets/dash3.jpg"
import Banner4 from "../assets/dash4.jpg"

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: Banner1,
      eyebrow: "Farm-to-customer marketplace",
      title: "Fresh from the farm, delivered to your door.",
      description:
        "Shop directly from local farmers and enjoy fresh produce with simple, reliable delivery.",
    },
    {
      id: 2,
      image: Banner2,
      eyebrow: "Fresh food, better choice",
      title: "Taste the difference of truly fresh food.",
      description:
        "Discover naturally fresh fruits, vegetables, and farm products brought to you with care.",
    },
    {
      id: 3,
      image: Banner3,
      eyebrow: "Seasonal goodness",
      title: "Eat with the seasons.",
      description:
        "Find what's growing now and enjoy seasonal produce at its freshest and most flavorful.",
    },
    {
      id: 4,
      image: Banner4,
      eyebrow: "Straight from local farmers",
      title: "Know where your food comes from.",
      description:
        "Support local growers, discover quality products, and buy with confidence.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  // Automatic sliding
  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="
              relative
              min-w-full
              h-60
              overflow-hidden
              sm:h-72
              md:h-80
              lg:h-96
            "
          >
            {/* Banner image */}
            <img
              src={slide.image}
              alt={`Banner ${slide.id}`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Dark gradient overlay */}
            <div
              className="
                absolute inset-0
                bg-linear-to-r
                from-primary-soft
                via-primary-soft/55
                via-45%
                to-transparent
              "
            />

            {/* Text */}
            <div
              className="
                relative z-10
                flex h-full
                max-w-2xl
                items-center
                px-6
                sm:px-10
                md:px-14
                lg:px-20
              "
            >
              <div className="text-white">
                <p
                  className="
                    mb-2
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-primary-active
                    sm:text-base
                  "
                >
                  {slide.eyebrow}
                </p>

                <h2
                  className="
                    max-w-xl
                    text-3xl
                    font-extrabold
                    leading-tight
                    sm:text-4xl
                    md:text-5xl
                    text-secondary
                  "
                >
                  {slide.title}
                </h2>

                <p
                  className="
                    italic
                    mt-4
                    max-w-lg
                    text-sm
                    leading-relaxed
                    text-muted
                    sm:text-base
                    md:text-lg
                  "
                >
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous button */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="
          btn btn-circle btn-sm
          absolute left-3 top-1/2
          z-20
          -translate-y-1/2
          border-none
          bg-base-100/80
          shadow-md
          hover:bg-base-100
          sm:btn-md
        "
      >
        <FaChevronLeft />
      </button>

      {/* Next button */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="
          btn btn-circle btn-sm
          absolute right-3 top-1/2
          z-20
          -translate-y-1/2
          border-none
          bg-base-100/80
          shadow-md
          hover:bg-base-100
          sm:btn-md
        "
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div
        className="
          absolute
          bottom-4
          left-1/2
          z-20
          flex
          -translate-x-1/2
          gap-2
        "
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              h-2
              rounded-full
              transition-all
              duration-300
              ${
                currentSlide === index
                  ? "w-7 bg-primary"
                  : "w-2 bg-white/70 hover:bg-white"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
