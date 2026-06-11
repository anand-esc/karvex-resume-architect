// src/pages/Landing.jsx
// Public landing page using the refreshed page structure and landing sections.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { HeroGeometric } from "./HeroGeometric";
import { HowItWorksSection } from "./HowItWorksSection";
import { FeaturesSection } from "./FeaturesSection";
import { AudienceSection } from "./AudienceSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";
import { Footer } from "./Footer";

const navLinks = [
  { id: "features", label: "Jobs", href: "#features" },
  { id: "audience", label: "Learn", href: "#audience" },
  { id: "testimonials", label: "Companies", href: "#testimonials" },
  { id: "pricing", label: "Recruiters", href: "#pricing" },
  { id: "faq", label: "Blog", href: "#faq" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("features");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) navigate("/home");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-950">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="inline-flex items-center gap-3 no-underline">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-400 text-sm font-black text-stone-950 shadow-sm">
              K
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Career toolkit</p>
              <p className="text-lg font-bold tracking-tight text-stone-950">KARVEX</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-stone-600 lg:justify-center">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`transition ${
                  activeSection === link.id
                    ? "text-brand-500 font-semibold"
                    : "hover:text-stone-900"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-stone-700 transition hover:text-stone-900"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-brand-400 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-brand-500"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroGeometric />

        <section id="features">
          <HowItWorksSection />
          <FeaturesSection />
        </section>

        <section id="audience">
          <AudienceSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <section id="pricing">
          <PricingSection />
        </section>

        <section id="faq">
          <FAQSection />
        </section>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
