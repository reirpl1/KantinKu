import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl-5xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">Halaman yang kamu cari tidak ada.</p>
      <Link
        href="/"
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
