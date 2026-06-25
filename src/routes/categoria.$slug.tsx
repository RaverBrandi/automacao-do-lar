import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard, type ArticleCardData } from "@/components/site/ArticleCard";
import { SkeletonCard } from "@/components/site/SkeletonCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Sidebar } from "@/components/site/Sidebar";

async function fetchCategory(slug: string) {
  const { data } = await supabase.from("categories").select("id,name,description,slug").eq("slug", slug).maybeSingle();
  return data;
}
async function fetchByCategory(categoryId: number) {
  const { data } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,image_url,published_at,categories(name,slug)")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })
    .limit(30);
  return (data ?? []) as unknown as ArticleCardData[];
}

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params, context }) => {
    const cat = await context.queryClient.ensureQueryData({
      queryKey: ["cat", params.slug],
      queryFn: () => fetchCategory(params.slug),
    });
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.category;
    if (!c) return {};
    return {
      meta: [
        { title: `${c.name} — Automação do Lar` },
        { name: "description", content: c.description ?? `Notícias sobre ${c.name}` },
        { property: "og:title", content: `${c.name} — Automação do Lar` },
        { property: "og:description", content: c.description ?? `Notícias sobre ${c.name}` },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => <div className="py-20 text-center">Categoria não encontrada</div>,
  errorComponent: ({ error }) => <div className="py-20 text-center text-sm text-muted-foreground">{error.message}</div>,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { data: articles, isLoading } = useQuery({
    queryKey: ["cat-articles", category.id],
    queryFn: () => fetchByCategory(category.id),
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
      <div className="mb-6"><AdSlot variant="leaderboard" /></div>

      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Categoria</p>
        <h1 className="text-4xl md:text-5xl font-extrabold">{category.name}</h1>
        {category.description && <p className="mt-3 text-lg text-muted-foreground">{category.description}</p>}
        {articles && <p className="mt-2 text-sm text-muted-foreground">{articles.length} {articles.length === 1 ? "artigo" : "artigos"}</p>}
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          {articles?.map((a) => <ArticleCard key={a.id} article={a} />)}
          {articles && articles.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">Nenhum artigo nesta categoria ainda.</div>
          )}
        </div>
        <Sidebar popular={articles ?? []} />
      </div>
    </div>
  );
}
