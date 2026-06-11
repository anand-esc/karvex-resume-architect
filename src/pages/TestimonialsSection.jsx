import PropTypes from "prop-types";
import { motion } from "framer-motion";

export function TestimonialsColumn({ testimonials, className = "", duration = 15 }) {
  return (
    <div className={`flex flex-col gap-6 w-full max-w-sm overflow-hidden ${className}`}>
      <motion.div
        className="flex flex-col gap-6 w-full"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {[...testimonials, ...testimonials].map((t, i) => (
          <div key={i} className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl flex flex-col gap-4">
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">“{t.text}”</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 flex items-center justify-center font-bold text-brand-700 dark:text-brand-400">
                {t.role.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-50">{t.role}</span>
                <span className="text-xs text-stone-500">{t.company}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

TestimonialsColumn.propTypes = {
  testimonials: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
  duration: PropTypes.number,
};

const testimonials = [
  {
    text: "KARVEX's ATS scanner completely changed my resume game. I went from zero callbacks to landing 3 interviews in a single week.",
    role: "Software Engineer",
    company: "Odoo",
  },
  {
    text: "The career roadmaps gave me a clear path from DSA basics to system design. I followed it religiously and cracked my dream company.",
    role: "Backend Engineer",
    company: "LTI Mindtree",
  },
  {
    text: "As someone pivoting into AI, the structured learning modules and project recommendations on KARVEX were exactly what I needed.",
    role: "AI Engineer",
    company: "Vizuara AI Labs",
  },
  {
    text: "The mock interview prep and skill verification tests helped me identify my weak spots before the actual interviews. Absolute game-changer.",
    role: "Full Stack Developer",
    company: "Accelaya",
  },
  {
    text: "I discovered KARVEX during my final year. The curated job listings saved me hours of scrolling through irrelevant postings.",
    role: "Frontend Developer",
    company: "Tech Mahindra",
  },
  {
    text: "The AI-powered resume tips were spot on. My resume score jumped from 45 to 92, and I started getting recruiter messages the same week.",
    role: "Data Analyst",
    company: "Theax",
  },
  {
    text: "KARVEX's company explorer helped me research companies before interviews. Knowing the tech stack and culture gave me a real edge.",
    role: "ML Engineer",
    company: "Hidden Brains",
  },
  {
    text: "The DSA and SQL practice modules are incredibly well-structured. I cleared every online assessment I attempted after using them.",
    role: "DevOps Engineer",
    company: "Coforge",
  },
  {
    text: "As a recruiter, the tools streamlined our entire hiring pipeline. We reduced our time-to-hire by almost 40%.",
    role: "HR Manager",
    company: "Zoho",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-white/10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 mb-6">
            <span className="h-1.5 w-1.5 bg-brand-400" />
            shipped offers
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-none">
            Real professionals.{" "}
            <span className="text-stone-400 dark:text-stone-600">
              Real offers.
            </span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
            Nine quotes from individuals who used the platform to refine their resume and shipped an offer this year.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] h-[600px] overflow-hidden relative">
          {/* Gradient masking for smooth top/bottom fade out */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-stone-50 to-transparent dark:from-stone-950 z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-50 to-transparent dark:from-stone-950 z-10 pointer-events-none" />
          
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:flex"
            duration={29}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:flex"
            duration={22}
          />
        </div>
      </div>
    </section>
  );
}
