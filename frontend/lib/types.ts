export type Lang = "tr" | "en";

export interface SiteSettings {
  site_title: string;
  logo: string;
  logo_footer: string;
  hero_video: string;
  hero_poster: string;
  hero_line1_tr: string;
  hero_line1_en: string;
  hero_line2_tr: string;
  hero_line2_en: string;
  page_header_image: string;
  footer_text_tr: string;
  footer_text_en: string;
  phone: string;
  phone_es: string;
  email: string;
  address: string;
  linkedin: string;
  map_embed: string;
  footer_gallery: string[];
  copyright_tr: string;
  copyright_en: string;
  credit_name: string;
  credit_url: string;
  references_heading_projects: string;
  references_heading_experience: string;
  references_flow: string;
  cookie_banner_enabled: boolean;
  [key: string]: unknown;
}

export interface Page {
  key: string;
  title_tr: string;
  title_en: string;
  subtitle_tr: string;
  subtitle_en: string;
  body_tr: string;
  body_en: string;
  image: string;
  header_image: string;
}

export interface Service {
  id: number;
  slug: string;
  title_tr: string;
  title_en: string;
  summary_tr: string;
  summary_en: string;
  body_tr: string;
  body_en: string;
  image: string;
  sort_order: number;
  show_on_home: boolean;
  is_published: boolean;
}

export interface Post {
  id: number;
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  body_tr: string;
  body_en: string;
  image: string;
  tags: string;
  published_at: string;
  views: number;
  is_published: boolean;
}

export interface Project {
  id: number;
  client: string;
  title_tr: string;
  title_en: string;
  category_tr: string;
  category_en: string;
}

export interface Experience {
  id: number;
  flag: string;
  country_tr: string;
  country_en: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  tags_tr: string;
  tags_en: string;
}

export interface Feature {
  id: number;
  title_tr: string;
  title_en: string;
  text_tr: string;
  text_en: string;
  icon: string;
}
