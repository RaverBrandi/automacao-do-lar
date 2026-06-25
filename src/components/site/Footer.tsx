import { Link } from "@tanstack/react-router";

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

export function Footer() {
  return (
    <footer className="mt-20 bg-[#0F172A] text-white/90">
      <div className="mx-auto max-w-[1280px] px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="text-xl font-extrabold text-white">Automação do Lar</div>
          <p className="mt-3 text-sm text-white/70 max-w-sm">
            O portal brasileiro de notícias sobre casa inteligente, IoT, Alexa, Google Home, segurança e automação residencial.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3">Categorias</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {CATS.map((c) => (
              <li key={c.slug}>
                <Link to="/categoria/$slug" params={{ slug: c.slug }} className="hover:text-white text-white/80">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3">Sobre</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white text-white/80">Quem somos</a></li>
            <li><a href="#" className="hover:text-white text-white/80">Política de privacidade</a></li>
            <li><a href="#" className="hover:text-white text-white/80">Contato</a></li>
            <li><a href="#" className="hover:text-white text-white/80">Anuncie aqui</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-6 py-5 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Automação do Lar · automacaodolar.com.br</span>
          <span>Feito no Brasil 🇧🇷</span>
        </div>
      </div>
    </footer>
  );
}
