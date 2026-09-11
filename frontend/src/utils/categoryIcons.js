import {
  GiMilkCarton,
  GiWheat,
  GiChiliPepper,
  GiChicken,
  GiCow,
  GiFruitBowl,
  GiCarrot,
  GiField,
  GiGreenhouse,
  GiFruitTree,
} from "react-icons/gi";

const CATEGORY_ICONS = {
  field:GiField,
  greenhouse:GiGreenhouse,
  orchard:GiFruitTree,
  dairyFarm:GiMilkCarton,
  poultryFarm:GiChicken,
  livestockFarm:GiCow,
};

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || GiWheat;