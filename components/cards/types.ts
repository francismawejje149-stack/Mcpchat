export type CardPayload = {
  type: "grid" | "profile" | "list" | "stat" | "map" | "generic";
  title?: string;
  subtitle?: string;
  items?: any[];
  detail?: any;
  links?: { label: string; href: string }[];
};
