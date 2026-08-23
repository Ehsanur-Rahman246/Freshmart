import { CiLocationOn } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { FaCartShopping } from "react-icons/fa6";
 
 const ProductCard = ({image, name, src, price, badge: Badge}) => {
   return (
    <div className="w-50 h-75 flex flex-col bg-base-300 rounded-[10px] shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:[box-shadow:0_14px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] m-2.5 p-1 text-left overflow-hidden">        <img src={image} alt="Product" className='w-full h-35 overflow-hidden rounded-tl-md rounded-tr-md' />
        <p className="pt-2 ml-1 text-2xl">{name}</p>
        <div className="flex flex-row items-center pb-2 ml-1 gap-0.5">
          <CiLocationOn className="text-[12px] text-muted" />
          <p className="text-[12px] text-muted">{src}</p>
          <Badge className="size-4 ml-auto mr-1 text-muted"/>
        </div>
        <p className="font-medium pb-2.5 ml-1 text-3xl"><sup>&#2547;</sup>{price}<span className="text-muted"> / kg</span></p>
        <div className="flex gap-2 mt-auto">
          <button className="btn btn-primary flex-1 flex items-center justify-center gap-2">
              <FaCartShopping className="text-base" />
              <span>Add to cart</span>
          </button>
          <button className="btn btn-square btn-ghost">  
            <BsThreeDots />
          </button>
        </div>
     </div>
   )
 }
 
 export default ProductCard