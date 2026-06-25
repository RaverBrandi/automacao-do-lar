import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBadge } from "@/components/site/CategoryBadge";
import { AdSlot } from "@/components/site/AdSlot";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import { formatPtDate, readTime } from "@/lib/format";

type FullArticle = ArticleCardData & {
  content: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

async function fetchArticle(slug: string): Promise<FullArticle | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,content,image_url,published_at,categories(name,slug),profiles(full_name,avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as FullArticle | null;
}

async function fetchRelated(categorySlug: string | undefined, excludeId: string) {
  let q = supabase
    .from("articles")
    .select("id,title,slug,excerpt,image_url,published_at,categories(name,slug)")
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(6);
  if (categorySlug) {
    // get category by slug
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
    if (cat) q = q.eq("category_id", cat.id);
  }
  const { data } = await q;
  return (data ?? []) as unknown as ArticleCardData[];
}

export const Route = createFileRoute("/artigo/$slug")({
  loader: async ({ params, context }) => {
    const article = await context.queryClient.ensureQueryData({
      queryKey: ["article", params.slug],
      queryFn: () => fetchArticle(params.slug),
    });
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return {};
    return {
      meta: [
        { title: `${a.title} — Automação do Lar` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:image", content: a.image_url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: a.image_url },
      ],
    };
  },
  component: ArticlePage,
  errorComponent: ({ error }) => (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <p className="text-muted-foreground">Não foi possível carregar este artigo.</p>
      <pre className="text-xs mt-4">{error.message}</pre>
    </div>
  ),
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h1 className="text-3xl font-bold">Artigo não encontrado</h1>
      <Link to="/" className="inline-block mt-6 text-primary font-semibold">← Voltar para a home</Link>
    </div>
  ),
});

function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="fixed top-0 left-0 h-[3px] bg-primary z-50 transition-[width]" style={{ width: `${p}%` }} />;
}

function ShareBar({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", color: "bg-[#25D366]", href: `https://wa.me/?text=${enc(title + " " + url)}` },
    { name: "Facebook", color: "bg-[#1877F2]", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "X", color: "bg-black", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { name: "Telegram", color: "bg-[#229ED9]", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
  ];
  return (
    <>
      <div className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener" aria-label={`Compartilhar no ${l.name}`}
            className={`h-11 w-11 rounded-full text-white inline-flex items-center justify-center text-xs font-bold ${l.color} shadow-md hover:scale-110 transition`}>
            {l.name[0]}
          </a>
        ))}
        <button onClick={() => navigator.clipboard.writeText(url)} aria-label="Copiar link"
          className="h-11 w-11 rounded-full bg-secondary text-foreground inline-flex items-center justify-center text-xs font-bold shadow-md hover:bg-muted transition">
          🔗
        </button>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 px-4 py-3 flex gap-2 justify-around">
        {links.map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noopener"
            className={`h-10 flex-1 rounded-xl text-white inline-flex items-center justify-center text-xs font-bold ${l.color}`}>
            {l.name}
          </a>
        ))}
      </div>
    </>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const { data: related = [] } = useQuery({
    queryKey: ["related", article.id, article.categories?.slug],
    queryFn: () => fetchRelated(article.categories?.slug, article.id),
  });

  // Split content into paragraphs for ad insertion
  const paragraphs: string[] = String(article.content ?? "").split(/(?=<p)/);
  const adAfter = new Set<number>([3, 7, 12]);
  const productAfter = 5;

  return (
    <article className="mx-auto max-w-[860px] px-4 md:px-6 py-8 pb-24 lg:pb-8">
      <ReadingProgress />
      <ShareBar title={article.title} />

      <nav className="text-xs text-muted-foreground mb-4 flex gap-2 items-center">
        <Link to="/" className="hover:text-primary">Home</Link>
        {article.categories && (
          <>
            <span>›</span>
            <Link to="/categoria/$slug" params={{ slug: article.categories.slug }} className="hover:text-primary">{article.categories.name}</Link>
          </>
        )}
      </nav>

      {article.categories && <CategoryBadge name={article.categories.name} slug={article.categories.slug} size="md" />}
      <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">{article.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center font-semibold text-foreground">
          {article.profiles?.avatar_url ? (
            <img src={article.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{(article.profiles?.full_name ?? "A")[0]}</span>
          )}
        </div>
        <div>
          <div className="font-semibold text-foreground">{article.profiles?.full_name ?? "Redação"}</div>
          <div className="text-xs">{formatPtDate(article.published_at)} · {readTime(article.content)} min de leitura</div>
        </div>
        <div className="ml-auto"><FavoriteButton articleId={article.id} floating={false} /></div>
      </div>

      <img
        src={article.image_url}
        alt={article.title}
        fetchPriority="high"
        className="mt-6 w-full aspect-[16/9] object-cover rounded-2xl"
      />

      <div className="article-body mt-10 max-w-[760px] mx-auto">
        {paragraphs.map((p, i) => (
          <div key={i}>
            <div dangerouslySetInnerHTML={{ __html: p }} />
            {adAfter.has(i + 1) && <div className="my-8"><AdSlot variant="in-article" /></div>}
            {i + 1 === productAfter && (
              <div className="my-8 rounded-2xl border border-border p-4 bg-card flex gap-4 items-center">
                <img src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&q=80" alt="" className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Oferta Patrocinada</span>
                  <p className="font-bold mt-1">Echo Dot 5ª Geração</p>
                  <p className="text-sm text-muted-foreground">A partir de <strong className="text-foreground">R$ 299</strong></p>
                </div>
                <a href="#" className="px-4 py-2.5 rounded-xl bg-[var(--color-success)] text-white font-semibold text-sm whitespace-nowrap">Ver Oferta</a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12"><AdSlot variant="matched" /></div>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Você Também Pode Gostar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>
    </article>
  );
}
