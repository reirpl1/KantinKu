import Link from "next/link";
import { rupiah, type Menu } from "@/data/menu";
import TombolFavorit from "@/components/TombolFavorit";

export default function KartuMenu({ menu }: { menu: Menu }) {
  const habis = menu.stok === 0;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-colors ${
        habis ? "bg-gray-200 opacity-70" : "bg-white"
      }`}
    >
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        {menu.kategori}
      </span>

      <h3 className="mt-2 text-lg font-semibold">{menu.nama}</h3>
      <TombolFavorit item={menu} />

      <p className="mt-2 font-medium">{rupiah(menu.harga)}</p>

      <p className={habis ? "text-sm text-red-600" : "text-sm text-green-700"}>
        {habis ? "Habis" : `Stok ${menu.stok}`}
      </p>

      {habis ? (
        <button
          type="button"
          disabled
          className="mt-3 rounded bg-gray-400 px-3 py-1.5 text-sm text-white cursor-not-allowed"
        >
          Menu Habis
        </button>
      ) : (
        <Link
          href={`/menu/${menu.id}`}
          className="mt-3 inline-block rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Lihat detail
        </Link>
      )}
    </div>
  );
}
