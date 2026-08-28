import { CiLocationOn } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { FaCartShopping } from "react-icons/fa6";
 
 const ProductCard = ({image, name, src, price, badge: Badge}) => {
   return (
    <div className="w-[calc((100vw-28px)/2)] max-w-50 h-70 flex flex-col bg-base-300 rounded-[10px] shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:[box-shadow:0_14px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] p-1 text-left overflow-hidden">
      <div className="relative">
      <img
        src={image}
        alt={name}
        className="w-full h-30 object-cover rounded-tl-md rounded-tr-md"
      />

    </div>

      <div className="flex items-center ml-1 gap-0.5 min-w-0">
        <p className="pt-2 ml-1 text-2xl truncate">{name}</p>
        <Badge className="size-4 ml-auto mr-1 text-primary-active shrink-0" />
      </div>
      <div className="flex items-center pb-2 ml-1 gap-0.5 min-w-0">
        <CiLocationOn className="shrink-0 text-[12px] text-muted" />
        <p className="text-[12px] text-muted truncate">{src}</p>
      </div>
      <p className="font-medium pb-2.5 ml-1 text-3xl">
        <sup>&#2547;</sup>{price}
        <span className="text-muted"> / kg</span>
      </p>
      <div className="flex gap-2 mt-auto">
        <button className="btn btn-primary flex-1 flex items-center justify-center gap-2">
          <FaCartShopping className="text-base shrink-0" />
          <span className="truncate text-xs sm:text-sm">Add to cart</span>
        </button>
        <button className="btn btn-square btn-ghost">
          <BsThreeDots />
        </button>
      </div>
    </div>
   )
 }
 
 export default ProductCard