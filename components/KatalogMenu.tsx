"use client";
import { useState } from "react";
import type { Menu } from "@/data/menu";
import KartuMenu from "./KartuMenu";

export default function KatalogMenu({ menu }: { menu: Menu[] }) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [urutan, setUrutan] = useState("awal");

  // TODO: hitung `hasil` dari menu, cari, kategori, dan urutan
  const hasilFilter = menu.filter((m) => {
    const cocokNama = m.nama.toLowerCase().includes(cari.toLowerCase());
    const cocokKategori = kategori === "Semua" || m.kategori === kategori;
    return cocokNama && cocokKategori;
  });

  const hasil = [...hasilFilter].sort((a, b) => {
    if (urutan === "termurah") return a.harga - b.harga;
    if (urutan === "termahal") return b.harga - a.harga;
    if (urutan === "nama") return a.nama.localeCompare(b.nama);
    return 0; // "awal": urutan tidak berubah
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari menu..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="Semua">Semua</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Camilan">Camilan</option>
        </select>
        <select
          value={urutan}
          onChange={(e) => setUrutan(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="awal">Urutan awal</option>
          <option value="termurah">Harga termurah</option>
          <option value="termahal">Harga termahal</option>
          <option value="nama">Nama A-Z</option>
        </select>
      </div>

      {hasil.length === 0 ? (
        <p>Menu tidak ditemukan.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((m) => (
            <KartuMenu key={m.id} menu={m} />
          ))}
        </div>
      )}
    </div>
  );
}
