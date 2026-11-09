"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface MenuItem {
  id: number;
  nama: string;
  harga: number;
  kategori?: string;
}

export default function FavoritPage() {
  // 1. Gunakan Lazy Initial State untuk menghindari setState di dalam useEffect
  const [favoritIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("favorit") || "[]") as number[];
    } catch {
      return [];
    }
  });

  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. useEffect hanya dipakai untuk fetch data dari API menu
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data menu");
        return res.json();
      })
      .then((data: MenuItem[]) => {
        setMenuList(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Memuat...</p>;
  if (error) return <p className="p-4 text-red-600">Gagal memuat data menu.</p>;

  const menuFavorit = menuList.filter((m) => favoritIds.includes(m.id));

  return (
    <main className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Favorit</h1>

      {menuFavorit.length === 0 ? (
        <p className="text-slate-600">Belum ada menu favorit.</p>
      ) : (
        <div className="space-y-3">
          {menuFavorit.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{item.nama}</h2>
                <p className="text-sm text-slate-600">
                  Rp {item.harga?.toLocaleString("id-ID")}
                </p>
              </div>
              <Link
                href={`/menu/${item.id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                Lihat Detail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
