export interface UserProps {
  first_name: string;
  last_name: string;
  email: string;
  tokens?: number;
  birth_date?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  skin_tone_classification?: string | null;
  season?: string | null;
  sub_season?: string | null;
  skin_tone_complements?: string[];
  body_type?: string | null;
  style_preferences?: string[];
  favorite_colors?: string[];
  preferred_brands?: string[];
  budget_min?: number | null;
  budget_max?: number | null;
  location?: string | null;
}
