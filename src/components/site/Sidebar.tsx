import { Link } from "@tanstack/react-router";
import { AdSlot } from "./AdSlot";
import type { ArticleCardData } from "./ArticleCard";
import { formatPtDate } from "@/lib/format";

const CATS = [
  { name: "Casa Inteligente", slug: "casa-inteligente" },
  { name: "Alexa & Echo", slug: "alexa-echo" },
  { name: "Google Home", slug: "google-home" },
  { name: "Segurança", slug: "seguranca" },
  { name: "Iluminação", slug: "iluminacao" },
  { name: "Energia", slug: "energia" },
  { name: "Reviews", slug: "reviews" },
  { name: "Ofertas", slug: "ofertas" },
];

const AFFILIATES = [
  { title: "Echo Dot 5ª Geração", price: "R$ 299", img: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&q=80" },
  { title: "Lâmpada Smart RGB", price: "R$ 69", img: "https://images.unsplash.com/photo-1565636192335-bc88497d12b6?w=300&q=80" },
  { title: "Câmera Tapo C200", price: "R$ 199", img: "https://images.unsplash.com/photo-1558002038-bb4237b54e0c?w=300&q=80" },
];

export function Sidebar({ popular }: { popular: ArticleCardData[] }) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-24">
      <AdSlot variant="sidebar" />

      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📈 Mais Lidas</h3>
        <ul className="space-y-3">
          {popular.slice(0, 5).map((a, i) => (
            <li key={a.id}>
              <Link
                to="/artigo/$slug"
                params={{ slug: a.slug }}
                className="flex gap-3 group"
              >
                <span className="text-2xl font-extrabold text-primary/30 leading-none w-6">{i + 1}</span>
                <img src={a.image_url} alt="" loading="lazy" className="h-16 w-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatPtDate(a.published_at)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-4">Categorias</h3>
        <ul className="grid grid-cols-2 gap-2">
          {CATS.map((c) => (
            <li key={c.slug}>
              <Link
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="block px-3 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-muted transition"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-4">Ofertas Selecionadas</h3>
        <div className="space-y-3">
          {AFFILIATES.map((p) => (
            <div key={p.title} className="flex gap-3 rounded-xl border border-border p-3 bg-card">
              <img src={p.img} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold line-clamp-2">{p.title}</p>
                <p className="text-base font-bold text-foreground mt-1">{p.price}</p>
                <a href="#" className="text-xs font-semibold text-[var(--color-success)] hover:underline">Ver Oferta →</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
