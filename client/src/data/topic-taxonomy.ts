import taxonomy from "./taxonomy.json";

export const TOPIC_TAXONOMY = taxonomy.categories;

export type SelectedCategory = {
  id: string;
  subcategories: string[];
};