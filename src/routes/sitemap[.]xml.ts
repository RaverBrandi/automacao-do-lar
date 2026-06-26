import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://automacao-do-lar.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/login", changefreq: "yearly", priority: "0.3" },
        ];

        try {
          const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const supabase = createClient(url, key, { auth: { persistSession: false } });
            const [{ data: articles }, { data: categories }] = await Promise.all([
              supabase
                .from("articles")
                .select("slug,published_at")
                .eq("status", "published")
                .order("published_at", { ascending: false }),
              supabase.from("categories").select("slug"),
            ]);
            for (const c of categories ?? []) {
              entries.push({ path: `/categoria/${c.slug}`, changefreq: "daily", priority: "0.8" });
            }
            for (const a of articles ?? []) {
              entries.push({
                path: `/artigo/${a.slug}`,
                lastmod: a.published_at ? new Date(a.published_at).toISOString() : undefined,
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          }
        } catch {
          // fall back to static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
