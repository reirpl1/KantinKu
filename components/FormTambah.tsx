"use client";
import { useState } from "react";
import { rupiah, type Menu } from "@/data/menu";
import { bacaKeranjang, simpanKeranjang } from "@/lib/keranjang";

export default function FormTambah({ item }: { item: Menu }) {
  const [jumlah, setJumlah] = useState(1);
  const [pesan, setPesan] = useState("");
  const [sukses, setSukses] = useState(false);

  function tambah() {
    const keranjang = bacaKeranjang();

    const baris = keranjang.find((k) => k.id === item.id);
    const sudah = baris ? baris.jumlah : 0;

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      setSukses(false);
      setPesan("Jumlah minimal 1.");
      return;
    }

    if (sudah + jumlah > item.stok) {
      setSukses(false);
      setPesan(
        sudah === 0
          ? `Jumlah melebihi stok (stok ${item.stok}).`
          : `Di keranjang sudah ada ${sudah}, stok hanya ${item.stok}.`,
      );
      return;
    }

    const baru = baris
      ? keranjang.map((k) =>
          k.id === item.id
            ? {
                ...k,
                nama: item.nama,
                harga: item.harga,
                stok: item.stok,
                jumlah: k.jumlah + jumlah,
              }
            : k,
        )
      : [
          ...keranjang,
          {
            id: item.id,
            nama: item.nama,
            harga: item.harga,
            stok: item.stok,
            jumlah,
          },
        ];

    simpanKeranjang(baru);

    setSukses(true);
    setPesan("Ditambahkan ke keranjang.");
  }

  return (
    <div className="mt-6 border-t pt-4">
      <label className="block text-sm font-medium text-slate-700">
        Jumlah
        <input
          type="number"
          min={1}
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
          className="mt-1 block w-24 rounded border px-3 py-2"
        />
      </label>

      <p className="mt-3 font-semibold">
        Total: {rupiah(item.harga * (jumlah > 0 ? jumlah : 0))}
      </p>

      <button
        type="button"
        onClick={tambah}
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Tambah ke keranjang
      </button>

      {pesan && (
        <p className={sukses ? "mt-2 text-green-700" : "mt-2 text-red-600"}>
          {pesan}
        </p>
      )}
    </div>
  );
}
