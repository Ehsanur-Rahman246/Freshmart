import { CiLocationOn } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { FaCartShopping, FaHeart } from "react-icons/fa6";
import { useState, useRef } from "react";
import { Link } from "react-router";
import ProductCardSkeleton from "./ProductCardSkeleton";

const MIN_SKELETON_MS = 300;

const ProductCard = ({ id, image, name, src, price, badge: Badge }) => {
  const [favorites, setFavorites] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // eslint-disable-next-line react-hooks/purity
  const mountTime = useRef(Date.now());

  const handleImageLoad = () => {
    const elapsed = Date.now() - mountTime.current;
    const remaining = MIN_SKELETON_MS - elapsed;

    if (remaining > 0) {
      setTimeout(() => setImgLoaded(true), remaining);
    } else {
      setImgLoaded(true);
    }
  };

  // Hidden <img> so it keeps loading (and can fire onLoad) even while
  // we're showing the skeleton in its place.
  const hiddenLoader = image && (
    <img
      src={image}
      alt=""
      className="hidden"
      onLoad={handleImageLoad}
      aria-hidden="true"
    />
  );

  if (!imgLoaded) {
    return (
      <>
        {hiddenLoader}
        <ProductCardSkeleton />
      </>
    );
  }

  return (
    <div className="product-card w-[calc((100vw-28px)/2)] max-w-50 h-70 flex flex-col bg-base-300 rounded-[10px] shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:[box-shadow:0_14px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] p-1 my-2 text-left overflow-hidden">
      <div className="relative w-full h-30 rounded-tl-md rounded-tr-md overflow-hidden bg-base-200">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-30 object-cover rounded-tl-md rounded-tr-md"
        />

        <button
          onClick={() => setFavorites(!favorites)}
          className="absolute right-0 top-0 btn btn-ghost btn-circle"
        >
          <FaHeart
            className={`text-2xl ${favorites ? "text-red-400" : "text-white"}`}
          />
        </button>
      </div>

      <div className="flex items-center ml-1 gap-0.5 min-w-0">
        <p className="pt-2 ml-1 text-2xl truncate">{name}</p>
        {Badge && (
          <Badge className="size-4 ml-auto mr-1 text-primary-active shrink-0" />
        )}
      </div>
      <div className="flex items-center pb-2 ml-1 gap-0.5 min-w-0">
        <CiLocationOn className="shrink-0 text-[12px] text-muted" />
        <p className="text-[12px] text-muted truncate">{src}</p>
      </div>
      <p className="font-medium pb-2.5 ml-1 text-3xl">
        <sup>&#2547;</sup>
        {price}
        <span className="text-muted"> / kg</span>
      </p>
      <div className="flex gap-2 mt-auto">
        <button className="btn btn-primary flex-1 flex items-center justify-center gap-2">
          <FaCartShopping className="text-base shrink-0" />
          <span className="truncate text-xs sm:text-sm">Add to cart</span>
        </button>
        <Link to={`/products/${id}`}>
          <button className="btn btn-square btn-ghost">
            <BsThreeDots />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;