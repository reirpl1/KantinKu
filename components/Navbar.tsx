"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bacaKeranjang } from "@/lib/keranjang";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/menu", label: "Menu" },
  { href: "/favorit", label: "Favorit" },
  { href: "/keranjang", label: "Keranjang" },
  { href: "/riwayat", label: "Riwayat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
    function hitung() {
      const total = bacaKeranjang().reduce((sum, k) => sum + k.jumlah, 0);
      setJumlah(total);
    }
    hitung();
    window.addEventListener("keranjang-berubah", hitung);
    return () => window.removeEventListener("keranjang-berubah", hitung);
  }, []);

  return (
    <nav className="flex items-center gap-6 border-b bg-white px-6 py-3">
      <Link href="/" className="text-lg font-bold text-blue-600">
        KantinKu
      </Link>
      {links.map((l) => {
        const aktif =
          l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        const label =
          l.href === "/keranjang" && jumlah > 0
            ? `Keranjang (${jumlah})`
            : l.label;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              aktif
                ? "font-semibold text-blue-600"
                : "text-slate-600 hover:text-blue-600"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
