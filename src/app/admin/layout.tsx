import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="font-bold text-violet-400 text-xl tracking-tight">
              10JITAL Admin
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors"
              >
                Produits
              </Link>
              <Link
                href="/admin/products/new"
                className="px-3 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                + Nouveau produit
              </Link>
              <a
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors"
              >
                Voir le site
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6 sm:p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}