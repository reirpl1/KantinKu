"use client";
import { useState } from "react";
import { rupiah } from "@/data/menu";
import { bacaRiwayat, type Pesanan } from "@/lib/riwayat";

export default function DaftarFavorit() {
  const [daftar] = useState<Pesanan[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const data = bacaRiwayat();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  if (daftar.length === 0) {
    return <p className="text-slate-600">Belum ada riwayat pesanan.</p>;
  }

  return (
    <ul className="space-y-3">
      {daftar.map((p) => (
        <li key={p.id} className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-semibold">{p.nama}</p>
            <p className="text-sm text-slate-500">{p.waktu}</p>
          </div>
          <ul className="mt-2 text-sm">
            {p.baris.map((b) => (
              <li key={b.nama}>
                {b.nama} x{b.jumlah} = {rupiah(b.subtotal)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-slate-600">
            {p.cara === "antar"
              ? `Diantar ke ${p.kelas}`
              : "Diambil sendiri di kantin"}
          </p>
          <p className="mt-1 font-bold">Total: {rupiah(p.total)}</p>
        </li>
      ))}
    </ul>
  );
}
