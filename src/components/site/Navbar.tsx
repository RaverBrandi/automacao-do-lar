import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { name: "Casa Inteligente", slug: "casa-inteligente" },
  { name: "Alexa & Echo", slug: "alexa-echo" },
  { name: "Google Home", slug: "google-home" },
  { name: "Segurança", slug: "seguranca" },
  { name: "Iluminação", slug: "iluminacao" },
  { name: "Energia", slug: "energia" },
  { name: "Reviews", slug: "reviews" },
  { name: "Ofertas", slug: "ofertas" },
];

export function Navbar() {
  const { user } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    if (!search) return;
    const t = setTimeout(async () => {
      if (query.length < 2) return setResults([]);
      const { data } = await supabase
        .from("articles")
        .select("slug,title")
        .eq("status", "published")
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(8);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:block sticky top-0 z-40 bg-surface border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 h-[72px] flex items-center gap-8">
          <Link to="/" className="text-xl font-extrabold text-primary tracking-tight whitespace-nowrap">
            Automação do Lar
          </Link>
          <nav className="flex items-center gap-1 flex-1">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-secondary transition flex items-center gap-1"
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearch(true)} aria-label="Buscar" className="h-10 w-10 rounded-full hover:bg-secondary inline-flex items-center justify-center">
              <Search size={18} />
            </button>
            <Link to="/favoritos" aria-label="Favoritos" className="h-10 w-10 rounded-full hover:bg-secondary inline-flex items-center justify-center">
              <Heart size={18} />
            </Link>
            <Link
              to="/login"
              className="ml-1 px-4 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-secondary inline-flex items-center"
            >
              {user ? "Minha conta" : "Entrar"}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-border">
        <div className="px-4 h-16 flex items-center justify-between">
          <button onClick={() => setDrawer(true)} aria-label="Menu" className="h-10 w-10 inline-flex items-center justify-center">
            <Menu size={22} />
          </button>
          <Link to="/" className="font-extrabold text-primary">Automação do Lar</Link>
          <button onClick={() => setSearch(true)} aria-label="Buscar" className="h-10 w-10 inline-flex items-center justify-center">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition ${drawer ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!drawer}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawer(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[320px] max-w-[85vw] bg-surface shadow-xl transition-transform duration-300 ease-out ${drawer ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-border">
            <span className="font-extrabold text-primary">Automação do Lar</span>
            <button onClick={() => setDrawer(false)} aria-label="Fechar" className="h-10 w-10 inline-flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
          <nav className="p-2 flex flex-col">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                onClick={() => setDrawer(false)}
                className="px-3 py-3 rounded-lg hover:bg-secondary text-sm font-medium"
              >
                {c.name}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            <Link to="/favoritos" onClick={() => setDrawer(false)} className="px-3 py-3 rounded-lg hover:bg-secondary text-sm font-medium flex items-center gap-2">
              <Heart size={16} /> Favoritos
            </Link>
            <Link to="/login" onClick={() => setDrawer(false)} className="mt-2 px-3 py-3 rounded-xl bg-primary text-primary-foreground text-center font-semibold">
              {user ? "Minha conta" : "Entrar"}
            </Link>
          </nav>
        </aside>
      </div>

      {/* Search modal */}
      {search && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm" onClick={() => setSearch(false)}>
          <div className="mx-auto max-w-2xl mt-24 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-surface rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="flex items-center px-4 border-b border-border">
                <Search size={18} className="text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar notícias..."
                  className="flex-1 px-3 py-4 bg-transparent outline-none text-base"
                />
                <button onClick={() => setSearch(false)} className="h-10 w-10 inline-flex items-center justify-center"><X size={18} /></button>
              </div>
              {results.length > 0 && (
                <ul className="max-h-[60vh] overflow-auto">
                  {results.map((r) => (
                    <li key={r.slug}>
                      <Link
                        to="/artigo/$slug"
                        params={{ slug: r.slug }}
                        onClick={() => setSearch(false)}
                        className="block px-4 py-3 hover:bg-secondary text-sm"
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {query.length >= 2 && results.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">Nenhum resultado</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
