export interface UserProps {
  first_name: string;
  last_name: string;
  email: string;
  tokens?: number;
  birth_date?: string;
  gender?: string;
  height?: string;
  skin_tone_classification?: string;
  style_preferences?: string[];
  favorite_color?: string;
  budget_preferences?: {
    high: number;
    low: number;
  };
}
