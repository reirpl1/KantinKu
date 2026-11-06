import { notFound } from "next/navigation";
import Link from "next/link";
import { menu, rupiah } from "@/data/menu";
import FormTambah from "@/components/FormTambah";

export default async function DetailMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = menu.find((m) => m.id === Number(id));
  if (!item) notFound();

  const habis = item.stok === 0;

  return (
    <article className="rounded-xl border bg-white p-6">
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        {item.kategori}
      </span>
      <h1 className="mt-2 text-3xl font-bold">{item.nama}</h1>
      <p className="mt-4 text-xl font-semibold">{rupiah(item.harga)}</p>
      <p className={habis ? "text-red-600" : "text-slate-600"}>
        {habis ? "Habis" : `Stok ${item.stok}`}
      </p>

      {habis ? (
        <p className="mt-6 font-medium text-red-600">Menu ini habis.</p>
      ) : (
        <FormTambah item={item} />
      )}

      <Link
        href="/menu"
        className="mt-6 inline-block text-blue-600 hover:underline"
      >
        ← Kembali ke menu
      </Link>
    </article>
  );
}
