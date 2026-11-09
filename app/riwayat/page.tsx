"use client";

import { useState, useEffect } from "react";

interface PesananItem {
  nama: string;
  harga: number;
  jumlah: number;
}

interface Pesanan {
  waktu: string;
  nama: string;
  menu: PesananItem[];
  subtotal?: number;
  diskon?: number;
  ongkir?: number;
  total: number;
  caraAmbil: string;
  kelas?: string;
}

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Membaca riwayat setelah komponen dimuat di browser
  useEffect(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem("riwayat") || "[]",
      ) as Pesanan[];

      setRiwayat(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal membaca riwayat:", error);
      setRiwayat([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi menghapus seluruh riwayat
  const hapusRiwayat = () => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus seluruh riwayat pesanan?",
    );

    if (!konfirmasi) return;

    localStorage.removeItem("riwayat");
    setRiwayat([]);
  };

  const totalPesanan = riwayat.length;

  const totalSemuaBelanja = riwayat.reduce(
    (acc, curr) => acc + (curr.total || 0),
    0,
  );

  const formatTanggal = (waktuStr: string) => {
    if (!waktuStr) return "Waktu tidak tersedia";

    const tanggal = new Date(waktuStr);

    if (isNaN(tanggal.getTime())) return waktuStr;

    return tanggal.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Tampilan sementara sebelum data selesai dibaca
  if (isLoading) {
    return (
      <main className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Riwayat</h1>
        <p className="text-slate-500">Memuat riwayat pesanan...</p>
      </main>
    );
  }

  // Tampilan jika belum ada pesanan
  if (riwayat.length === 0) {
    return (
      <main className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Riwayat</h1>
        <p className="text-slate-600">Belum ada pesanan.</p>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat</h1>

        <button
          type="button"
          onClick={hapusRiwayat}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Hapus Riwayat
        </button>
      </div>

      {/* Ringkasan Pesanan */}
      <div className="bg-slate-100 p-4 rounded border text-sm font-medium text-slate-800">
        Ringkasan: {totalPesanan} pesanan, total belanja Rp{" "}
        {totalSemuaBelanja.toLocaleString("id-ID")}
      </div>

      {/* Daftar Riwayat */}
      <div className="space-y-4">
        {riwayat.map((pesanan, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg bg-white shadow-sm space-y-2"
          >
            <div className="flex justify-between text-xs text-slate-500 border-b pb-1">
              <span>{formatTanggal(pesanan.waktu)}</span>

              <span className="font-semibold text-slate-700">
                Pemesan: {pesanan.nama}
              </span>
            </div>

            <div className="space-y-1">
              {pesanan.menu?.map((m, i) => (
                <p key={i} className="text-sm text-slate-700">
                  • {m.nama} x {m.jumlah} = Rp{" "}
                  {(m.harga * m.jumlah).toLocaleString("id-ID")}
                </p>
              ))}
            </div>

            <div className="text-xs text-slate-600 pt-1">
              Cara Ambil:{" "}
              {pesanan.caraAmbil === "diantar"
                ? `Diantar ke ${pesanan.kelas}`
                : "Ambil sendiri di kantin"}
            </div>

            <div className="font-bold text-sm text-slate-900 border-t pt-2 flex justify-between">
              <span>Total Bayar:</span>
              <span>Rp {pesanan.total?.toLocaleString("id-ID")}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
