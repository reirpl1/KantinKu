export type ItemKeranjang = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  jumlah: number;
};

const KUNCI = "keranjang";

export function bacaKeranjang(): ItemKeranjang[] {
  try {
    const mentah = localStorage.getItem(KUNCI);
    return mentah ? JSON.parse(mentah) : [];
  } catch {
    return [];
  }
}

export function simpanKeranjang(isi: ItemKeranjang[]) {
  localStorage.setItem(KUNCI, JSON.stringify(isi));
  window.dispatchEvent(new Event("keranjang-berubah"));
}
