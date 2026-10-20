import "server-only";
import { notFound } from "next/navigation";
import type { Experience, Feature, Page, Post, Project, Service, SiteSettings } from "./types";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND}/api/public${path}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  site: () => get<SiteSettings>("/site"),
  page: (key: string) => get<Page>(`/pages/${key}`),
  services: (home = false) => get<Service[]>(`/services${home ? "?home=true" : ""}`),
  service: (slug: string) => get<Service>(`/services/${encodeURIComponent(slug)}`),
  posts: (limit?: number) => get<Post[]>(`/posts${limit ? `?limit=${limit}` : ""}`),
  post: (slug: string, countView = true) =>
    get<Post>(`/posts/${encodeURIComponent(slug)}?count_view=${countView}`),
  references: () => get<{ projects: Project[]; experiences: Experience[] }>("/references"),
  features: () => get<Feature[]>("/features"),
};
