import Link from "next/link";
import { menu } from "@/data/menu";
import KartuMenu from "@/components/KartuMenu";

export default function Home() {
  // data menu tidak punya angka penjualan, jadi "laris" dipilih manual lewat id
  const idLaris = [1, 3, 5];
  const menuLaris = menu.filter((m) => idLaris.includes(m.id));

  return (
    <div>
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold">KantinKu</h1>
        <p className="mt-3 text-slate-600">
          Pesan makanan dan minuman kantin sekolah tanpa antre.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Lihat Menu
        </Link>
      </section>

      <h2 className="mb-3 text-xl font-semibold">Menu laris</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menuLaris.map((m) => (
          <KartuMenu key={m.id} menu={m} />
        ))}
      </div>
    </div>
  );
}
