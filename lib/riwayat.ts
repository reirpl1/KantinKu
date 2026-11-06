export type BarisPesanan = {
  nama: string;
  jumlah: number;
  subtotal: number;
};

export type Pesanan = {
  id: number;
  waktu: string;
  nama: string;
  cara: "ambil" | "antar";
  kelas: string;
  baris: BarisPesanan[];
  subtotal: number;
  diskon: number;
  ongkir: number;
  total: number;
};

const KUNCI = "riwayat";

export function bacaRiwayat(): Pesanan[] {
  try {
    const mentah = localStorage.getItem(KUNCI);
    return mentah ? JSON.parse(mentah) : [];
  } catch {
    return [];
  }
}

export function simpanPesanan(pesanan: Pesanan) {
  localStorage.setItem(KUNCI, JSON.stringify([pesanan, ...bacaRiwayat()]));
}
