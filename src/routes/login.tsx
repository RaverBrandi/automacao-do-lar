import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Automação do Lar" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="mx-auto max-w-[400px] px-4 py-16">
      <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8 border border-border">
        <h1 className="text-2xl font-extrabold text-center">Entrar no Automação do Lar</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">Acesse seus favoritos em qualquer dispositivo</p>

        <button
          onClick={handleGoogle}
          className="mt-6 w-full h-11 rounded-xl border border-border bg-white text-foreground font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 7 29.6 5 24 5 16.1 5 9.3 9.1 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.6c-2 1.5-4.7 2.6-7.7 2.6-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.2 38.7 16 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.6 5.6c-.5.5 7-5 7-15.2 0-1.2-.1-2.4-.4-3.5z"/></svg>
          Continuar com Google
        </button>

        <div className="my-6 flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">ou</span><div className="flex-1 h-px bg-border" /></div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text" required placeholder="Nome completo"
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background outline-none focus:border-primary"
            />
          )}
          <input
            type="email" required placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background outline-none focus:border-primary"
          />
          <input
            type="password" required placeholder="Senha" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background outline-none focus:border-primary"
          />
          <button
            type="submit" disabled={busy}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60"
          >
            {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-primary font-semibold"
        >
          {mode === "login" ? "Criar conta" : "Já tenho conta"}
        </button>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">← Voltar para a home</Link>
      </div>
    </div>
  );
}
