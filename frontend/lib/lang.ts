import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE } from "./i18n";
import type { Lang } from "./types";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return value === "en" ? "en" : "tr";
}
