export type Menu = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
};

export const menu: Menu[] = [
  { id: 1, nama: "Nasi Goreng", kategori: "Makanan", harga: 12000, stok: 15 },
  { id: 2, nama: "Mie Ayam", kategori: "Makanan", harga: 10000, stok: 20 },
  { id: 3, nama: "Jus Alpukat", kategori: "Minuman", harga: 8000, stok: 30 },
  { id: 4, nama: "Es Teh", kategori: "Minuman", harga: 3000, stok: 20 },
  { id: 5, nama: "Risol Mayo", kategori: "Makanan", harga: 4000, stok: 10 },
  { id: 6, nama: "Pisang Goreng", kategori: "Makanan", harga: 2000, stok: 0 },
];

export function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
