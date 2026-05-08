export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0eb] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-lg font-semibold tracking-tight text-[#2d4a2d]">
          🏔 Friluftskompis
        </span>
        <div className="flex items-center gap-6 text-sm text-[#4a6741]">
          <a href="#features" className="hover:text-[#2d4a2d] transition-colors">Funksjoner</a>
          <a href="#om" className="hover:text-[#2d4a2d] transition-colors">Om</a>
          <a
            href="/turer"
            className="rounded-full bg-[#2d4a2d] px-4 py-2 text-white hover:bg-[#3d6b3d] transition-colors"
          >
            Kom i gang
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d4e8c2] px-4 py-1.5 text-sm text-[#2d4a2d] mb-8">
          <span>🌿</span>
          <span>Din smarte turkompis</span>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-[#1a2e1a] leading-tight max-w-3xl">
          Friluftskompis
        </h1>

        <p className="mt-6 text-xl text-[#4a5e3a] max-w-xl leading-relaxed">
          Planlegg norske friluftsopplevelser med AI. Finn turer, sjekk vær,
          inviter venner og pakk smarter – alt på ett sted.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/turer"
            className="rounded-full bg-[#2d4a2d] px-8 py-3.5 text-base font-medium text-white hover:bg-[#3d6b3d] transition-colors shadow-md"
          >
            Planlegg din neste tur
          </a>
          <a
            href="#features"
            className="rounded-full border border-[#a0b890] px-8 py-3.5 text-base font-medium text-[#2d4a2d] hover:bg-[#e8f0e0] transition-colors"
          >
            Se hva vi tilbyr
          </a>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-[#1a2e1a] mb-12">
            Alt du trenger for turen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🗺",
                title: "Turforslag",
                desc: "Få anbefalte turer basert på sesong, vanskelighetsgrad og område.",
              },
              {
                icon: "🌤",
                title: "Værvarsler",
                desc: "Live Yr-data for valgt tur – nedbør, temperatur og vind dag for dag.",
              },
              {
                icon: "🎒",
                title: "AI-pakkeliste",
                desc: "Automatisk pakkeliste tilpasset vær, varighet og antall deltakere.",
              },
              {
                icon: "🏕",
                title: "Hyttekart",
                desc: "Interaktivt kart med DNT-hytter og overnattingsmuligheter.",
              },
              {
                icon: "👥",
                title: "Inviter venner",
                desc: "Del turen med en lenke og planlegg sammen.",
              },
              {
                icon: "🧾",
                title: "Etteroppgjør",
                desc: "Hold styr på utgifter og gjør opp etter turen.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#e0e8d8] bg-[#f8fbf5] p-6 hover:shadow-sm transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#1a2e1a] mb-1">{f.title}</h3>
                <p className="text-sm text-[#5a6e50] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#2d4a2d] py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Klar for neste eventyr?
        </h2>
        <p className="text-[#a8c898] mb-8 text-lg">
          Friluftskompis hjelper deg fra idé til hjemkomst.
        </p>
        <a
          href="/start"
          className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-medium text-[#2d4a2d] hover:bg-[#f0f8ec] transition-colors"
        >
          Start planleggingen gratis
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-6 text-center text-sm text-[#6a8a5a]">
        © 2025 Friluftskompis · Laget med ❤️ for norsk natur
      </footer>
    </div>
  );
}
