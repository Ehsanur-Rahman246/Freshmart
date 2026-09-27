import {
  GiMilkCarton,
  GiChicken,
  GiCow,
  GiField,
  GiGreenhouse,
  GiFruitTree,
} from "react-icons/gi";

const SOURCE_ICONS = {
  field: GiField,
  greenhouse: GiGreenhouse,
  orchard: GiFruitTree,
  dairyFarm: GiMilkCarton,
  poultryFarm: GiChicken,
  livestockFarm: GiCow,
};

export const getSourceIcon = (category) => SOURCE_ICONS[category] || GiField;
