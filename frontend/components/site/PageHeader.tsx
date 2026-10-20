export default function PageHeader({ title, image }: { title: string; image?: string }) {
  return (
    <section
      className="relative flex h-[220px] items-center justify-center bg-[#2b2b2b] bg-cover bg-center sm:h-[330px]"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <h1 className="relative px-4 text-center text-[28px] uppercase text-white sm:text-[40px]">{title}</h1>
    </section>
  );
}
