"use client";
import { useState } from "react";

interface MenuItem {
  id: number;
  nama: string;
  harga: number | string;
  stok: number;
  kategori: string;
}

export default function TombolFavorit({ item }: { item: MenuItem }) {
  const [isFavorit, setIsFavorit] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const favorit = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      return Array.isArray(favorit) && favorit.includes(item.id);
    } catch {
      return false;
    }
  });

  const toggleFavorit = () => {
    try {
      const favorit = JSON.parse(
        localStorage.getItem("favorit") || "[]",
      ) as number[];
      const favoritList = Array.isArray(favorit) ? favorit : [];
      let favoritBaru: number[];

      if (isFavorit) {
        favoritBaru = favoritList.filter((id) => id !== item.id);
      } else {
        favoritBaru = [...favoritList, item.id];
      }

      localStorage.setItem("favorit", JSON.stringify(favoritBaru));
      setIsFavorit(!isFavorit);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorit}
      suppressHydrationWarning // <-- TAMBAHKAN INI UNTUK MENGHINDARI ERROR HYDRATION
      className="mt-4 flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
    >
      {isFavorit ? "♥ Favorit" : "♡ Tambah favorit"}
    </button>
  );
}
