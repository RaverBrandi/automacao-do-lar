import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function FavoriteButton({ articleId, floating = true }: { articleId: string; floating?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return setFav(false);
    supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle()
      .then(({ data }) => setFav(!!data));
  }, [user, articleId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (busy) return;
    setBusy(true);
    if (fav) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", articleId);
      if (error) toast.error("Erro ao remover");
      else setFav(false);
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, article_id: articleId });
      if (error) toast.error("Erro ao favoritar");
      else {
        setFav(true);
        toast.success("Adicionado aos favoritos");
      }
    }
    setBusy(false);
  }

  const base = floating
    ? "absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-md hover:bg-white"
    : "h-9 w-9 rounded-full bg-secondary hover:bg-muted";

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Remover favorito" : "Favoritar"}
      className={`${base} inline-flex items-center justify-center transition`}
    >
      <Heart className={`h-4.5 w-4.5 ${fav ? "fill-red-500 text-red-500" : "text-foreground"}`} size={18} />
    </button>
  );
}
