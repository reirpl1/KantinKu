"use client";
import { useEffect, useState } from "react";
import { menu, rupiah } from "@/data/menu";
import {
  bacaKeranjang,
  simpanKeranjang,
  type ItemKeranjang,
} from "@/lib/keranjang";
import { simpanPesanan, type Pesanan } from "@/lib/riwayat";

const MIN_PROMO = 20000;
const ONGKIR = 2000;

export default function IsiKeranjang() {
  const [isi, setIsi] = useState<ItemKeranjang[]>([]);
  const [siap, setSiap] = useState(false);

  const [cara, setCara] = useState<"ambil" | "antar">("ambil");
  const [kelas, setKelas] = useState("");

  const [kode, setKode] = useState("");
  const [promoAktif, setPromoAktif] = useState(false);
  const [pesanPromo, setPesanPromo] = useState("");

  const [nama, setNama] = useState("");
  const [galat, setGalat] = useState("");
  const [struk, setStruk] = useState<Pesanan | null>(null);

  useEffect(() => {
    setIsi(bacaKeranjang());
    setSiap(true);
  }, []);

  function perbarui(baru: ItemKeranjang[]) {
    setIsi(baru);
    simpanKeranjang(baru);
  }

  function ubahJumlah(id: number, selisih: number, stok: number) {
    const baru = isi.map((k) => {
      if (k.id !== id) return k;
      const jumlahBaru = k.jumlah + selisih;
      if (jumlahBaru < 1 || jumlahBaru > stok) return k;
      return { ...k, jumlah: jumlahBaru };
    });
    perbarui(baru);
  }

  function hapus(id: number) {
    perbarui(isi.filter((k) => k.id !== id));
  }

  // hitungan dibuat saat render, bukan disimpan di state
  const subtotal = isi.reduce((sum, k) => {
    const m = menu.find((x) => x.id === k.id);
    return m ? sum + m.harga * k.jumlah : sum;
  }, 0);

  const diskon =
    promoAktif && subtotal >= MIN_PROMO ? Math.round(subtotal * 0.1) : 0;
  const ongkir = cara === "antar" ? ONGKIR : 0;
  const total = subtotal - diskon + ongkir;

  function pakaiPromo() {
    const kodeRapi = kode.trim().toUpperCase();
    if (kodeRapi !== "HEMAT10") {
      setPromoAktif(false);
      setPesanPromo("Kode promo tidak dikenal.");
      return;
    }
    if (subtotal < MIN_PROMO) {
      setPromoAktif(false);
      setPesanPromo("Promo HEMAT10 butuh belanja minimal Rp 20.000.");
      return;
    }
    setPromoAktif(true);
    setPesanPromo("Promo HEMAT10 dipakai: diskon 10%.");
  }

  function pesanSekarang() {
    // 1. validasi
    if (nama.trim().length < 3) {
      setGalat("Nama pemesan minimal 3 huruf.");
      return;
    }
    if (cara === "antar" && kelas.trim().length < 3) {
      setGalat("Kelas wajib diisi minimal 3 karakter.");
      return;
    }
    setGalat("");

    // 2. salin datanya ke objek struk SEBELUM keranjang dikosongkan
    const baris = isi.flatMap((k) => {
      const m = menu.find((x) => x.id === k.id);
      return m
        ? [{ nama: m.nama, jumlah: k.jumlah, subtotal: m.harga * k.jumlah }]
        : [];
    });

    const pesanan: Pesanan = {
      id: Date.now(),
      waktu: new Date().toLocaleString("id-ID"),
      nama: nama.trim(),
      cara,
      kelas: kelas.trim(),
      baris,
      subtotal,
      diskon,
      ongkir,
      total,
    };

    // 3. simpan ke riwayat dan tampilkan struk
    simpanPesanan(pesanan);
    setStruk(pesanan);

    // 4. kosongkan keranjang, reset formulir dan promo
    perbarui([]);
    setNama("");
    setKelas("");
    setCara("ambil");
    setKode("");
    setPromoAktif(false);
    setPesanPromo("");
  }

  if (!siap) return null;

  const bagianStruk = struk && (
    <section className="mx-auto mb-6 w-full max-w-sm rounded-sm border border-dashed border-slate-400 bg-white p-5 font-mono text-sm shadow-md">
      <div className="text-center">
        <p className="text-lg font-bold tracking-widest">KANTINKU</p>
        <p className="text-xs text-slate-500">Kantin Sekolah</p>
        <p className="mt-1 text-xs text-slate-500">{struk.waktu}</p>
      </div>

      <div className="my-3 border-t border-dashed border-slate-400" />

      <h2 className="text-center font-bold">Terima kasih, {struk.nama}!</h2>

      <div className="my-3 border-t border-dashed border-slate-400" />

      <ul className="space-y-1">
        {struk.baris.map((b) => (
          <li key={b.nama}>
            {b.nama} x{b.jumlah} = {rupiah(b.subtotal)}
          </li>
        ))}
      </ul>

      <div className="my-3 border-t border-dashed border-slate-400" />

      <div className="space-y-1">
        <p>Subtotal: {rupiah(struk.subtotal)}</p>
        {struk.diskon > 0 && <p>Diskon: - {rupiah(struk.diskon)}</p>}
        <p>
          {struk.cara === "antar"
            ? `Ongkir antar ke ${struk.kelas}: ${rupiah(struk.ongkir)}`
            : "Diambil sendiri di kantin"}
        </p>
      </div>

      <div className="my-3 border-t-2 border-double border-slate-400" />

      <p className="text-base font-bold">Total bayar: {rupiah(struk.total)}</p>

      <p className="mt-4 text-center text-xs text-slate-500">
        *** Simpan struk ini ***
      </p>
    </section>
  );

  if (isi.length === 0) {
    return (
      <div>
        {bagianStruk}
        {!struk && <p className="text-slate-600">Keranjang masih kosong.</p>}
      </div>
    );
  }

  return (
    <div>
      {bagianStruk}

      <ul className="space-y-3">
        {isi.map((k) => {
          const m = menu.find((x) => x.id === k.id);
          if (!m) return null;

          return (
            <li
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
            >
              <div>
                <p className="font-semibold">{m.nama}</p>
                <p className="text-sm text-slate-500">{rupiah(m.harga)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ubahJumlah(k.id, -1, m.stok)}
                  disabled={k.jumlah <= 1}
                  className="h-8 w-8 rounded border disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-8 text-center">{k.jumlah}</span>
                <button
                  type="button"
                  onClick={() => ubahJumlah(k.id, 1, m.stok)}
                  disabled={k.jumlah >= m.stok}
                  className="h-8 w-8 rounded border disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="font-medium">{rupiah(m.harga * k.jumlah)}</p>

              <button
                type="button"
                onClick={() => hapus(k.id)}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </li>
          );
        })}
      </ul>

      {/* Poin 12: kode promo */}
      <section className="mt-6 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Kode promo</h2>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Masukkan kode"
            className="rounded border px-3 py-2"
          />
          <button
            type="button"
            onClick={pakaiPromo}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Pakai
          </button>
        </div>
        {pesanPromo && (
          <p
            className={promoAktif ? "mt-2 text-green-700" : "mt-2 text-red-600"}
          >
            {pesanPromo}
          </p>
        )}
      </section>

      {/* Poin 13: cara ambil */}
      <section className="mt-4 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Cara ambil</h2>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="cara"
              checked={cara === "ambil"}
              onChange={() => setCara("ambil")}
            />
            Ambil sendiri
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="cara"
              checked={cara === "antar"}
              onChange={() => setCara("antar")}
            />
            Diantar (+Rp 2.000)
          </label>
        </div>

        {cara === "antar" && (
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Kelas
            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="mt-1 block w-48 rounded border px-3 py-2"
            />
          </label>
        )}
      </section>

      {/* Poin 13: ringkasan harga */}
      <section className="mt-4 rounded-xl border bg-white p-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{rupiah(subtotal)}</span>
        </div>
        {diskon > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Diskon</span>
            <span>- {rupiah(diskon)}</span>
          </div>
        )}
        {cara === "antar" && (
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span>{rupiah(ongkir)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
          <span>Total</span>
          <span>{rupiah(total)}</span>
        </div>
      </section>

      {/* Poin 14: pesan sekarang */}
      <section className="mt-4 rounded-xl border bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">
          Nama pemesan
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded border px-3 py-2"
          />
        </label>
        {galat && <p className="mt-2 text-red-600">{galat}</p>}
        <button
          type="button"
          onClick={pesanSekarang}
          className="mt-3 rounded bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
        >
          Pesan sekarang
        </button>
      </section>
    </div>
  );
}
