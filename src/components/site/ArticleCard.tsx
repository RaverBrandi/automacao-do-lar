import { Link } from "@tanstack/react-router";
import { CategoryBadge } from "./CategoryBadge";
import { FavoriteButton } from "./FavoriteButton";
import { formatPtDate, readTime } from "@/lib/format";

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string | null;
  content?: string;
  categories?: { name: string; slug: string } | null;
};

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group relative rounded-2xl bg-card shadow-[var(--shadow-card)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
      <FavoriteButton articleId={article.id} />
      <Link to="/artigo/$slug" params={{ slug: article.slug }} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 space-y-2">
          {article.categories && (
            <CategoryBadge name={article.categories.name} slug={article.categories.slug} asLink={false} />
          )}
          <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground">{article.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
          <div className="flex items-center gap-2 pt-2 text-xs font-medium text-muted-foreground">
            <span>{formatPtDate(article.published_at)}</span>
            <span aria-hidden>·</span>
            <span>{readTime(article.content || article.excerpt)} min de leitura</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
