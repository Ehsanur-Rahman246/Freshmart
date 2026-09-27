const cards = [1, 2, 3, 4, 5, 6];

const Carousel = () => {
  return (
    <div className="mx-auto mt-25 flex w-[90%] overflow-x-auto border-[5px] border-red-500 [&::-webkit-scrollbar]:hidden">
      <div
        className="
          flex shrink-0 items-center justify-center gap-4 pr-4
          animate-[spin_5s_infinite_linear]
        "
      >
        {cards.map((card) => (
          <div
            key={card}
            className="
              flex h-20 w-20 shrink-0
              items-center justify-center
              rounded-[0.2em]
              bg-blue-400
              p-4
              text-center
              text-5xl
            "
          >
            {card}
          </div>
        ))}
      </div>

      {/* Duplicate group for seamless looping */}
      <div
        aria-hidden="true"
        className="
          flex shrink-0 items-center justify-center gap-4 pr-4
          animate-[spin_5s_infinite_linear]
        "
      >
        {cards.map((card) => (
          <div
            key={card}
            className="
              flex h-20 w-20 shrink-0
              items-center justify-center
              rounded-[0.2em]
              bg-blue-400
              p-4
              text-center
              text-5xl
            "
          >
            {card}
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              translate: 0;
            }
            to {
              translate: -100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Carousel;
