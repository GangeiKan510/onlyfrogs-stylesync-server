export interface ClothingProps {
  image_url: string;
  category: string;
  tags: string[];
  user_id: string;
  closet_id: string;
}

export interface UpdateClothingDetailsProps {
  image_url?: string;
  category?: string;
  tags?: string[];
  user_id?: string;
  closet_id?: string;
  season?: string[];
  occasion?: string[];
  color?: string;
  material?: string;
  pattern?: string;
  brand?: string;
  name?: string;
}
