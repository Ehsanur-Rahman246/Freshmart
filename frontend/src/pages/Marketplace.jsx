import ProductCard from "../components/ProductCard"
import { GiGreenhouse, GiField, GiFruitTree } from "react-icons/gi";
import * as dairy from "../products/dairy";
import * as fruits from "../products/fruits";
import * as vegetables from "../products/vegetables";
import { useRef } from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react"
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Marketplace = () => {
  const marketplaceRef = useRef(null);

  useGSAP(() => {
    gsap.utils.toArray(".product-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0.5,
        scale: 0.85,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top 100%",
          end: "top 60%",
          scrub: true,
        },
      });
    });
  }, {scope: marketplaceRef});


  return (
    <>
    <div ref={marketplaceRef} className="flex justify-center px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:space-x-4 sm:space-y-6 w-fit">        
        <ProductCard image={dairy.Butter1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Cheese} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Milk1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Ghee1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Doi} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Strawberry2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={vegetables.CherryTomato} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Bel} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Banana2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Coconut4} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={vegetables.Broccoli} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={vegetables.Carrot} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={dairy.Butter1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Cheese} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Milk1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Ghee1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Doi} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Strawberry2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={vegetables.CherryTomato} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Bel} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Banana2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Coconut4} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={vegetables.Broccoli} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={vegetables.Carrot} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={dairy.Butter1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Cheese} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Milk1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Ghee1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Doi} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Strawberry2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={vegetables.CherryTomato} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Bel} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Banana2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Coconut4} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={vegetables.Broccoli} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={vegetables.Carrot} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={dairy.Butter1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Cheese} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Milk1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Ghee1} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={dairy.Doi} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Strawberry2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={vegetables.CherryTomato} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiGreenhouse}/>
        <ProductCard image={fruits.Bel} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Banana2} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={fruits.Coconut4} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiFruitTree}/>
        <ProductCard image={vegetables.Broccoli} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
        <ProductCard image={vegetables.Carrot} name={"Butter"} src={"Gazipur dairy farm"} price={250} badge={GiField}/>
      </div>
    </div>
    </>
  )
}

export default Marketplace