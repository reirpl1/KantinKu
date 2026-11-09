"use client";
import { useState } from "react";

interface ItemKeranjang {
  id: number;
  nama: string;
  harga: number | string;
  jumlah: number;
  stok: number;
}

export default function IsiKeranjang() {
  // Menggunakan Lazy Initial State agar bersih dari linter set-state-in-effect
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const data = JSON.parse(localStorage.getItem("keranjang") || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Gagal membaca keranjang:", error);
      return [];
    }
  });

  const [kodePromo, setKodePromo] = useState("");
  const [diskonAktif, setDiskonAktif] = useState(false);
  const [pesanPromo, setPesanPromo] = useState("");
  const [caraAmbil, setCaraAmbil] = useState("sendiri");
  const [kelas, setKelas] = useState("");
  const [namaPemesan, setNamaPemesan] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [struk, setStruk] = useState("");

  const updateDanSimpan = (dataBaru: ItemKeranjang[]) => {
    setKeranjang(dataBaru);
    localStorage.setItem("keranjang", JSON.stringify(dataBaru));
    window.dispatchEvent(new Event("keranjang-berubah"));
  };

  const parseHarga = (harga: unknown): number => {
    if (typeof harga === "number") return harga;
    if (!harga) return 0;
    const cleaned = String(harga).replace(/[^0-9]/g, "");
    return Number(cleaned) || 0;
  };

  const ubahJumlah = (index: number, delta: number) => {
    const dataBaru = [...keranjang];
    const item = dataBaru[index];
    const jumlahBaru = item.jumlah + delta;

    if (jumlahBaru < 1 || jumlahBaru > item.stok) return;
    item.jumlah = jumlahBaru;
    updateDanSimpan(dataBaru);
  };

  const hapusItem = (index: number) => {
    const dataBaru = keranjang.filter((_, i) => i !== index);
    updateDanSimpan(dataBaru);
  };

  const subtotal = keranjang.reduce(
    (acc, item) => acc + parseHarga(item.harga) * Number(item.jumlah || 1),
    0,
  );

  const isDiskonValid = diskonAktif && subtotal >= 20000;
  const nilaiDiskon = isDiskonValid ? Math.round(subtotal * 0.1) : 0;
  const ongkir = caraAmbil === "diantar" ? 2000 : 0;
  const totalBayar = subtotal - nilaiDiskon + ongkir;

  const handlePakaiPromo = () => {
    const kodeClean = kodePromo.trim().toUpperCase();
    if (kodeClean !== "HEMAT10") {
      setDiskonAktif(false);
      setPesanPromo("Kode promo tidak dikenal.");
      return;
    }
    if (subtotal < 20000) {
      setDiskonAktif(false);
      setPesanPromo("Promo HEMAT10 butuh belanja minimal Rp 20.000.");
      return;
    }
    setDiskonAktif(true);
    setPesanPromo("Promo HEMAT10 dipakai: diskon 10%.");
  };

  const handlePesanSekarang = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!namaPemesan || namaPemesan.trim().length < 3) {
      setErrorMsg("Nama pemesan minimal 3 huruf.");
      return;
    }

    if (caraAmbil === "diantar" && (!kelas || kelas.trim().length < 3)) {
      setErrorMsg("Kelas wajib diisi minimal 3 karakter jika diantar.");
      return;
    }

    if (keranjang.length === 0) {
      setErrorMsg("Keranjang masih kosong.");
      return;
    }

    let strukText = `Terima kasih, ${namaPemesan}!\n`;
    keranjang.forEach((item) => {
      const hargaNum = parseHarga(item.harga);
      strukText += `- ${item.nama} x${item.jumlah} = Rp ${(hargaNum * item.jumlah).toLocaleString("id-ID")}\n`;
    });
    strukText += `Subtotal: Rp ${subtotal.toLocaleString("id-ID")}`;
    if (isDiskonValid) {
      strukText += `, Diskon: Rp ${nilaiDiskon.toLocaleString("id-ID")}`;
    }
    if (caraAmbil === "diantar") {
      strukText += `, Ongkir antar ke ${kelas}: Rp 2.000`;
    } else {
      strukText += `, Diambil sendiri di kantin`;
    }
    strukText += `, Total bayar: Rp ${totalBayar.toLocaleString("id-ID")}`;

    setStruk(strukText);

    try {
      const riwayatLama = JSON.parse(
        localStorage.getItem("riwayat") || "[]",
      ) as unknown[];
      const pesananBaru = {
        waktu: new Date().toISOString(),
        nama: namaPemesan,
        menu: keranjang.map((item) => ({
          ...item,
          harga: parseHarga(item.harga),
        })),
        subtotal,
        diskon: nilaiDiskon,
        ongkir,
        total: totalBayar,
        caraAmbil,
        kelas: caraAmbil === "diantar" ? kelas : "Kantin",
        jumlahMenu: keranjang.reduce((acc, item) => acc + item.jumlah, 0),
      };

      localStorage.setItem(
        "riwayat",
        JSON.stringify([pesananBaru, ...riwayatLama]),
      );
    } catch (err) {
      console.error(err);
    }

    updateDanSimpan([]);
    setNamaPemesan("");
    setKelas("");
    setKodePromo("");
    setDiskonAktif(false);
  };

  if (keranjang.length === 0 && !struk) {
    return <p className="mt-4 text-slate-600">Keranjang masih kosong.</p>;
  }

  return (
    <div className="mt-4 space-y-6 max-w-xl">
      {struk && (
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-sm border border-slate-200 bg-white text-slate-800 shadow-lg">
          {/* Kepala struk */}
          <div className="px-6 pt-6 pb-4 text-center">
            <h2 className="text-2xl font-black tracking-widest">KANTINKU</h2>
            <p className="mt-1 text-xs tracking-widest text-slate-500">
              BUKTI PEMESANAN
            </p>
            <div className="mt-4 border-t border-dashed border-slate-400" />
          </div>

          {/* Status pesanan */}
          <div className="px-6 pb-3 text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-xs font-bold tracking-wider text-green-700">
              PESANAN BERHASIL
            </span>
          </div>

          {/* Isi struk */}
          <div className="px-6 pb-5">
            <div className="border-y border-dashed border-slate-400 py-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-700">
                {struk}
              </pre>
            </div>

            {/* Penutup */}
            <div className="pt-5 text-center">
              <p className="text-sm font-bold tracking-widest">TERIMA KASIH</p>
              <p className="mt-1 text-xs text-slate-500">
                Selamat menikmati pesanan Anda!
              </p>
              <p className="mt-3 text-[10px] tracking-widest text-slate-400">
                *** SIMPAN STRUK INI ***
              </p>
            </div>
          </div>

          {/* Efek tepi bawah kertas */}
          <div className="flex justify-between px-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-3 w-3 rotate-45 bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {keranjang.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {keranjang.map((item, index) => {
              const hargaNum = parseHarga(item.harga);
              const subtotalItem = hargaNum * Number(item.jumlah || 1);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md"
                >
                  <div className="space-y-1">
                    <h2 className="font-semibold text-lg text-slate-800">
                      {item.nama}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Harga satuan: Rp {hargaNum.toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Subtotal: Rp {subtotalItem.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => ubahJumlah(index, -1)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(index, 1)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => hapusItem(index)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Punya Kode Promo?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Coba: HEMAT10"
                value={kodePromo}
                onChange={(e) => setKodePromo(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handlePakaiPromo}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 transition-colors"
              >
                Pakai
              </button>
            </div>
            {pesanPromo && (
              <p className="text-xs font-medium text-slate-600">{pesanPromo}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Cara ambil:
            </label>
            <div className="flex space-x-6 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="caraAmbil"
                  value="sendiri"
                  checked={caraAmbil === "sendiri"}
                  onChange={() => setCaraAmbil("sendiri")}
                  className="accent-blue-600"
                />
                <span>Ambil sendiri</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="caraAmbil"
                  value="diantar"
                  checked={caraAmbil === "diantar"}
                  onChange={() => setCaraAmbil("diantar")}
                  className="accent-blue-600"
                />
                <span>Diantar (+Rp 2.000)</span>
              </label>
            </div>

            {caraAmbil === "diantar" && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kelas:
                </label>
                <input
                  type="text"
                  placeholder="Masukkan kelas (contoh: XII RPL)"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm shadow-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            {isDiskonValid && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Diskon (10%)</span>
                <span>-Rp {nilaiDiskon.toLocaleString("id-ID")}</span>
              </div>
            )}
            {caraAmbil === "diantar" && (
              <div className="flex justify-between text-slate-600">
                <span>Ongkir</span>
                <span>Rp 2.000</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Bayar</span>
              <span>Rp {totalBayar.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <form
            onSubmit={handlePesanSekarang}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama pemesan:
              </label>
              <input
                type="text"
                placeholder="Minimal 3 huruf"
                value={namaPemesan}
                onChange={(e) => setNamaPemesan(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3 font-bold text-white shadow-md hover:bg-green-700 transition-colors"
            >
              Pesan sekarang
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
