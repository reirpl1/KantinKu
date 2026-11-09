"use client";
import { useState, useEffect } from "react";

interface MenuItem {
  id: number;
  nama: string;
  harga: number | string;
  stok: number;
  kategori: string;
}

export default function TombolFavorit({ item }: { item: MenuItem }) {
  const [isClient, setIsClient] = useState(false);
  const [isFavorit, setIsFavorit] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const favorit = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      setIsFavorit(favorit.includes(item.id));
    } catch {
      setIsFavorit(false);
    }
  }, [item.id]);

  const toggleFavorit = () => {
    try {
      const favorit = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      let favoritBaru: number[];
      if (isFavorit) {
        favoritBaru = favorit.filter((id) => id !== item.id);
      } else {
        favoritBaru = [...favorit, item.id];
      }
      localStorage.setItem("favorit", JSON.stringify(favoritBaru));
      setIsFavorit(!isFavorit);
    } catch (err) {
      console.error(err);
    }
  };

  // Selama belum render di client, tampilkan tombol standar tanpa status favorit lokal
  // untuk mencegah perbedaan HTML antara server dan client.
  if (!isClient) {
    return (
      <button
        type="button"
        className="mt-4 flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        ♡ Tambah favorit
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFavorit}
      className="mt-4 flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium hover:bg-slate-50"
    >
      {isFavorit ? "♥ Favorit" : "♡ Tambah favorit"}
    </button>
  );
}
