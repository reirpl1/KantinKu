import { menu } from "@/data/menu";
import KatalogMenu from "@/components/KatalogMenu";
export default function MenuPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Menu</h1>
      <KatalogMenu menu={menu} />
    </main>
  );
}
