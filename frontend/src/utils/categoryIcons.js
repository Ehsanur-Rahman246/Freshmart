import {
  GiMilkCarton,
  GiWheat,
  GiChiliPepper,
  GiChicken,
  GiCow,
  GiTomato,
  GiFruitBowl,
} from "react-icons/gi";

const CATEGORY_ICONS = {
  dairy: GiMilkCarton,
  grain: GiWheat,
  spices: GiChiliPepper,
  poultry: GiChicken,
  livestock: GiCow,
  fruits: GiFruitBowl,
  vegetables: GiTomato,
};

export const getCategoryIcon = (category) =>
  CATEGORY_ICONS[category] || GiWheat;
