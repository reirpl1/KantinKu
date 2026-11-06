import Link from "next/link";
import { rupiah, type Menu } from "@/data/menu";

export default function KartuMenu({ menu }: { menu: Menu }) {
  const habis = menu.stok === 0;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        {menu.kategori}
      </span>
      <h3 className="mt-2 text-lg font-semibold">{menu.nama}</h3>
      <p className="mt-2 font-medium">{rupiah(menu.harga)}</p>
      <p className={habis ? "text-sm text-red-600" : "text-sm text-green-700"}>
        {habis ? "Habis" : `Stok ${menu.stok}`}
      </p>
      <Link
        href={`/menu/${menu.id}`}
        className="mt-3 inline-block rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      >
        Lihat detail
      </Link>
    </div>
  );
}