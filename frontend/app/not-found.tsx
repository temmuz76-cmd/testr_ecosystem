import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export default async function NotFound() {
  const d = t(await getLang());
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[96px] text-[var(--brand)]">404</h1>
      <h2 className="mb-6 text-[22px]">{d.notFound}</h2>
      <Link href="/" className="btn-brand">
        {d.backHome}
      </Link>
    </div>
  );
}
