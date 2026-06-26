import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { SkeletonCard } from "@/components/site/SkeletonCard";
import { AdSlot } from "@/components/site/AdSlot";
import { CategoryBadge } from "@/components/site/CategoryBadge";
import { Sidebar } from "@/components/site/Sidebar";
import { Fragment, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Automação do Lar — Notícias de casa inteligente e IoT" },
      { name: "description", content: "Tudo sobre automação residencial, Alexa, Google Home, segurança e ofertas de smart home no Brasil." },
      { property: "og:title", content: "Automação do Lar — Notícias de casa inteligente e IoT" },
      { property: "og:description", content: "Notícias e reviews de casa inteligente e IoT no Brasil." },
      { property: "og:url", content: "https://automacao-do-lar.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://automacao-do-lar.lovable.app/" }],
  }),
  component: HomePage,
});

async function fetchFeed(limit: number) {
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,image_url,published_at,categories(name,slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ArticleCardData[];
}

function HomePage() {
  const [limit, setLimit] = useState(12);
  const { data: articles, isLoading } = useQuery({
    queryKey: ["feed", limit],
    queryFn: () => fetchFeed(limit),
  });

  const hero = articles?.[0];
  const rest = articles?.slice(1) ?? [];
  const popular = articles ?? [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 md:py-8">
      <h1 className="sr-only">Automação do Lar — Notícias de casa inteligente e IoT no Brasil</h1>
      <div className="mb-6">
        <AdSlot variant="leaderboard" />
      </div>

      {/* Hero */}
      {isLoading && (
        <div className="aspect-[16/9] md:max-h-[480px] rounded-2xl bg-muted animate-pulse mb-10" />
      )}
      {hero && (
        <Link
          to="/artigo/$slug"
          params={{ slug: hero.slug }}
          className="block relative rounded-2xl overflow-hidden group mb-10 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition"
        >
          <div className="aspect-[16/9] md:aspect-[21/9] max-h-[480px] overflow-hidden">
            <img src={hero.image_url} alt={hero.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            {hero.categories && <CategoryBadge name={hero.categories.name} slug={hero.categories.slug} asLink={false} size="md" />}
            <h1 className="mt-3 text-2xl md:text-5xl font-extrabold leading-tight max-w-3xl">{hero.title}</h1>
            <p className="mt-3 hidden md:block text-base text-white/85 max-w-2xl line-clamp-2">{hero.excerpt}</p>
          </div>
        </Link>
      )}

      {/* Content + Sidebar */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            {rest.map((a, i) => {
              const showAd = (i + 1) % 6 === 0;
              return (
                <Fragment key={a.id}>
                  <ArticleCard article={a} />
                  {showAd && (
                    <div className="md:col-span-2 xl:col-span-3">
                      <AdSlot variant="in-feed" />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
          {articles && articles.length >= limit && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setLimit((l) => l + 12)}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[var(--color-primary-hover)] transition"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
        <Sidebar popular={popular} />
      </div>
    </div>
  );
}
