"use client";

import { useState, useEffect } from "react";

interface ItemKeranjang {
  id: number;
  nama: string;
  harga: number | string;
  jumlah: number;
  stok: number;
}

export default function IsiKeranjang() {
  // State keranjang
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [kodePromo, setKodePromo] = useState("");
  const [diskonAktif, setDiskonAktif] = useState(false);
  const [pesanPromo, setPesanPromo] = useState("");

  const [caraAmbil, setCaraAmbil] = useState("sendiri");
  const [kelas, setKelas] = useState("");
  const [namaPemesan, setNamaPemesan] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [struk, setStruk] = useState("");

  // Membaca keranjang setelah komponen dimuat di browser
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("keranjang") || "[]");

      setKeranjang(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal membaca keranjang:", error);
      setKeranjang([]);
    } finally {
      setIsClient(true);
    }
  }, []);

  // Fungsi menyimpan perubahan keranjang
  const updateDanSimpan = (dataBaru: ItemKeranjang[]) => {
    setKeranjang(dataBaru);

    localStorage.setItem("keranjang", JSON.stringify(dataBaru));

    window.dispatchEvent(new Event("keranjang-berubah"));
  };

  // Mengubah harga menjadi angka
  const parseHarga = (harga: unknown): number => {
    if (typeof harga === "number") return harga;
    if (!harga) return 0;

    const cleaned = String(harga).replace(/[^0-9]/g, "");

    return Number(cleaned) || 0;
  };

  // Format rupiah
  const formatRupiah = (angka: number) => {
    return angka.toLocaleString("id-ID");
  };

  // Menambah dan mengurangi jumlah barang
  const ubahJumlah = (index: number, delta: number) => {
    const dataBaru = [...keranjang];
    const item = dataBaru[index];

    const jumlahBaru = item.jumlah + delta;

    if (jumlahBaru < 1 || jumlahBaru > item.stok) return;

    item.jumlah = jumlahBaru;

    updateDanSimpan(dataBaru);
  };

  // Menghapus barang
  const hapusItem = (index: number) => {
    const dataBaru = keranjang.filter((_, i) => i !== index);

    updateDanSimpan(dataBaru);
  };

  // Menghitung subtotal
  const subtotal = keranjang.reduce(
    (acc, item) => acc + parseHarga(item.harga) * Number(item.jumlah || 1),
    0,
  );

  // Perhitungan diskon dan ongkir
  const isDiskonValid = diskonAktif && subtotal >= 20000;

  const nilaiDiskon = isDiskonValid ? Math.round(subtotal * 0.1) : 0;

  const ongkir = caraAmbil === "diantar" ? 2000 : 0;

  const totalBayar = subtotal - nilaiDiskon + ongkir;

  // Menggunakan kode promo
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

  // Memproses pesanan
  const handlePesanSekarang = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMsg("");

    // Validasi nama pemesan
    if (!namaPemesan || namaPemesan.trim().length < 3) {
      setErrorMsg("Nama pemesan minimal 3 huruf.");
      return;
    }

    // Validasi kelas jika pesanan diantar
    if (caraAmbil === "diantar" && (!kelas || kelas.trim().length < 3)) {
      setErrorMsg("Kelas wajib diisi minimal 3 karakter jika diantar.");
      return;
    }

    // Validasi keranjang
    if (keranjang.length === 0) {
      setErrorMsg("Keranjang masih kosong.");
      return;
    }

    // Membuat identitas transaksi
    const tanggal = new Date();

    const nomorTransaksi = `TRX-${tanggal.getTime().toString().slice(-8)}`;

    // Membuat isi struk
    let strukText = `
No. Transaksi : ${nomorTransaksi}
Tanggal       : ${tanggal.toLocaleDateString("id-ID")}
Waktu         : ${tanggal.toLocaleTimeString("id-ID")}
Nama Pemesan  : ${namaPemesan.trim()}
--------------------------------
DAFTAR PEMBELIAN
--------------------------------
`;

    keranjang.forEach((item) => {
      const hargaNum = parseHarga(item.harga);

      const totalItem = hargaNum * item.jumlah;

      strukText += `${item.nama}
${item.jumlah} x Rp ${formatRupiah(hargaNum)}
Subtotal: Rp ${formatRupiah(totalItem)}

`;
    });

    strukText += `--------------------------------
Subtotal      : Rp ${formatRupiah(subtotal)}
`;

    if (isDiskonValid) {
      strukText += `Diskon 10%    : -Rp ${formatRupiah(nilaiDiskon)}
`;
    }

    if (caraAmbil === "diantar") {
      strukText += `Ongkir        : Rp ${formatRupiah(ongkir)}
Diantar ke    : ${kelas.trim()}
`;
    } else {
      strukText += `Pengambilan   : Ambil sendiri
`;
    }

    strukText += `================================
TOTAL BAYAR   : Rp ${formatRupiah(totalBayar)}
================================`;

    setStruk(strukText);

    // Menyimpan transaksi ke riwayat
    try {
      const riwayatLama = JSON.parse(localStorage.getItem("riwayat") || "[]");

      const pesananBaru = {
        nomorTransaksi,
        waktu: tanggal.toISOString(),
        nama: namaPemesan.trim(),

        menu: keranjang.map((item) => ({
          ...item,
          harga: parseHarga(item.harga),
        })),

        subtotal,
        diskon: nilaiDiskon,
        ongkir,
        total: totalBayar,

        caraAmbil,

        kelas: caraAmbil === "diantar" ? kelas.trim() : "Kantin",

        jumlahMenu: keranjang.reduce((acc, item) => acc + item.jumlah, 0),
      };

      localStorage.setItem(
        "riwayat",
        JSON.stringify([
          pesananBaru,
          ...(Array.isArray(riwayatLama) ? riwayatLama : []),
        ]),
      );
    } catch (error) {
      console.error("Gagal menyimpan riwayat:", error);
    }

    // Mengosongkan keranjang setelah transaksi
    updateDanSimpan([]);

    setNamaPemesan("");
    setKelas("");
    setKodePromo("");
    setDiskonAktif(false);
    setPesanPromo("");
  };

  // Tampilan sementara saat membaca localStorage
  if (!isClient) {
    return <p className="mt-4 text-slate-500">Memuat keranjang...</p>;
  }

  // Jika keranjang kosong dan belum ada struk
  if (keranjang.length === 0 && !struk) {
    return <p className="mt-4 text-slate-600">Keranjang masih kosong.</p>;
  }

  return (
    <div className="mt-4 space-y-6 max-w-xl">
      {/* =============================== */}
      {/* STRUK PEMBELIAN */}
      {/* =============================== */}

      {struk && (
        <div className="flex justify-center py-5">
          <div className="w-full max-w-[360px] overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-xl">
            {/* Header Struk */}
            <div className="px-5 pt-6 pb-4 text-center">
              <div className="mb-2 text-3xl">🛒</div>

              <h2 className="text-xl font-black tracking-widest">
                KANTIN SEKOLAH
              </h2>

              <p className="mt-1 text-[10px] tracking-[0.3em] text-slate-500">
                FOOD & DRINK
              </p>

              <div className="mt-4 border-t border-dashed border-slate-400" />

              <p className="mt-3 text-xs font-bold tracking-widest">
                STRUK PEMBELIAN
              </p>

              <p className="mt-1 text-[10px] text-green-600 font-semibold">
                PESANAN BERHASIL
              </p>
            </div>

            {/* Detail Transaksi */}
            <div className="px-5 pb-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-[1.8] text-slate-700">
                {struk.trim()}
              </pre>
            </div>

            {/* Footer Struk */}
            <div className="px-5 pb-6 text-center">
              <div className="mb-4 border-t border-dashed border-slate-400" />

              <p className="text-sm font-black tracking-widest">
                TERIMA KASIH!
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Selamat menikmati pesanan Anda.
              </p>

              <p className="mt-4 text-[10px] text-slate-400">
                Simpan struk ini sebagai bukti pembelian.
              </p>

              <div className="mt-4 text-lg tracking-[0.4em]">* * * * *</div>
            </div>
          </div>
        </div>
      )}

      {/* =============================== */}
      {/* DAFTAR KERANJANG */}
      {/* =============================== */}

      {keranjang.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {keranjang.map((item, index) => {
              const hargaNum = parseHarga(item.harga);

              const subtotalItem = hargaNum * Number(item.jumlah || 1);

              return (
                <div
                  key={index}
                  className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-800">
                      {item.nama}
                    </h2>

                    <p className="text-sm text-slate-500">
                      Harga satuan: Rp {formatRupiah(hargaNum)}
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      Subtotal: Rp {formatRupiah(subtotalItem)}
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
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =============================== */}
          {/* KODE PROMO */}
          {/* =============================== */}

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-900"
              >
                Pakai
              </button>
            </div>

            {pesanPromo && (
              <p className="text-xs font-medium text-slate-600">{pesanPromo}</p>
            )}
          </div>

          {/* =============================== */}
          {/* CARA PENGAMBILAN */}
          {/* =============================== */}

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">
              Cara ambil:
            </label>

            <div className="flex space-x-6 text-sm">
              <label className="flex cursor-pointer items-center space-x-2">
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

              <label className="flex cursor-pointer items-center space-x-2">
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
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

          {/* =============================== */}
          {/* RINGKASAN PEMBAYARAN */}
          {/* =============================== */}

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>Rp {formatRupiah(subtotal)}</span>
            </div>

            {isDiskonValid && (
              <div className="flex justify-between font-medium text-green-600">
                <span>Diskon (10%)</span>
                <span>-Rp {formatRupiah(nilaiDiskon)}</span>
              </div>
            )}

            {caraAmbil === "diantar" && (
              <div className="flex justify-between text-slate-600">
                <span>Ongkir</span>
                <span>Rp {formatRupiah(ongkir)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total Bayar</span>
              <span>Rp {formatRupiah(totalBayar)}</span>
            </div>
          </div>

          {/* =============================== */}
          {/* FORM PEMESANAN */}
          {/* =============================== */}

          <form
            onSubmit={handlePesanSekarang}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
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
              <p className="text-xs font-medium text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3 font-bold text-white shadow-md transition-colors hover:bg-green-700"
            >
              Pesan sekarang
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
