import {
  GiMilkCarton,
  GiWheat,
  GiChiliPepper,
  GiChicken,
  GiCow,
  GiFruitBowl,
  GiCarrot,
} from "react-icons/gi";

const CATEGORY_ICONS = {
  dairy: GiMilkCarton,
  grain: GiWheat,
  spices: GiChiliPepper,
  poultry: GiChicken,
  livestock: GiCow,
  fruits: GiFruitBowl,
  vegetables: GiCarrot,
};

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || GiWheat;