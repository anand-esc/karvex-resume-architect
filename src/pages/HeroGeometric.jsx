import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight, Play, Star } from "lucide-react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const WINS = [
  { name: "Aarav", role: "SWE Intern", at: "Wipro" },
  { name: "Tanvi", role: "Frontend", at: "Mphasis" },
  { name: "Priya", role: "Data Intern", at: "LTIMindtree" },
  { name: "Rehan", role: "QA Intern", at: "Hexaware" },
  { name: "Rohan", role: "Associate", at: "Capgemini" },
  { name: "Sneha", role: "SDE Intern", at: "Cognizant" },
  { name: "Ishita", role: "Junior Dev", at: "Tech Mahindra" },
  { name: "Devansh", role: "Backend", at: "Josh Talks" },
  { name: "Karan", role: "SWE Intern", at: "NIIT" },
  { name: "Pooja", role: "Android", at: "CarWale" },
  { name: "Neha", role: "Data Analyst", at: "Nagarro" },
  { name: "Arjun", role: "Full Stack", at: "Newgen" },
  { name: "Ayush", role: "Backend", at: "Infosys" },
  { name: "Riya", role: "ML Intern", at: "Quinnox" },
  { name: "Meera", role: "ML Intern", at: "Hidden Brains" },
  { name: "Harsh", role: "DevOps", at: "Coforge" },
  { name: "Sakshi", role: "SDE Intern", at: "TCS" },
  { name: "Vikram", role: "Frontend", at: "Chaayos" },
  { name: "Ananya", role: "Product", at: "Zensar" },
  { name: "Nikhil", role: "SDE Intern", at: "Mindtree" },
  { name: "Ritika", role: "Support Eng", at: "HCL" },
  { name: "Siddharth", role: "Backend", at: "Sapient" },
  { name: "Zoya", role: "UX Intern", at: "Persistent" },
  { name: "Manan", role: "Junior Dev", at: "Birlasoft" },
  { name: "Kavya", role: "Web Dev", at: "Cyient" },
  { name: "Yash", role: "Intern", at: "Mastek" },
  { name: "Mehul", role: "Junior Dev", at: "Sonata Software" },
  { name: "Tara", role: "Frontend", at: "Syntel" },
];

function HeroGeometric() {
  const [user] = useAuthState(auth);
  const isAuthenticated = !!user;
  const getStartedHref = isAuthenticated ? "/home" : "/login";

  return (
    <section className="relative overflow-hidden bg-white text-stone-950 border-b border-stone-200">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-200 to-transparent pointer-events-none"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl text-center mx-auto">
          <span className="inline-flex items-center rounded-full bg-brand-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-brand-700">
            resume built for internships
          </span>

          <h1 className="mt-10 text-5xl font-black tracking-tight text-stone-950 sm:text-6xl md:text-7xl lg:text-8xl leading-tight">
            Land the
            <span className="block text-brand-400">internship.</span>
          </h1>

          <p className="mt-8 text-base leading-8 text-stone-600 sm:text-lg md:text-xl">
            KARVEX scores your resume, sharpens your DSA, runs mock interviews, and sends your application straight to recruiters hiring.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={getStartedHref} className="no-underline">
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-400 px-7 py-3.5 text-sm font-semibold text-stone-950 shadow-md shadow-brand-400/20 transition hover:bg-brand-500">
                {isAuthenticated ? "Open dashboard" : "Start free"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <a href="#demo" className="no-underline">
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-7 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50">
                <Play className="h-4 w-4" />
                Watch 90s demo
              </button>
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-stone-500 sm:flex-row">
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-400" />
              4.8 rating from 12k+ students
            </span>
            <span className="hidden sm:inline-block">·</span>
            <span>Free forever · ₹249/mo pro</span>
          </div>

          <AnimatedStats />
        </div>
      </div>

      <WinsMarquee />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 border-t border-stone-200">
        <div className="text-center text-xs font-mono uppercase tracking-[0.35em] text-stone-500">
          Trusted by students at
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-stone-500">
          <span>IITs</span>
          <span className="text-stone-300">/</span>
          <span>NITs</span>
          <span className="text-stone-300">/</span>
          <span>BITS Pilani</span>
          <span className="text-stone-300">/</span>
          <span>IIITs</span>
          <span className="text-stone-300">/</span>
          <span>VIT</span>
          <span className="text-stone-300">/</span>
          <span>SRM</span>
          <span className="text-stone-300">/</span>
          <span>Manipal</span>
          <span className="text-stone-300">/</span>
          <span>200+ colleges</span>
        </div>
      </div>
    </section>
  );
}

function AnimatedStats() {
  const [values, setValues] = useState({ resumes: 0, roles: 0, placements: 0 });
  useEffect(() => {
    const t = setTimeout(
      () => setValues({ resumes: 54230, roles: 1247, placements: 8900 }),
      700,
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-16 grid grid-cols-1 gap-3 rounded-3xl border border-stone-200 bg-stone-100 p-1 sm:grid-cols-3"
    >
      <StatCell value={values.resumes} label="resumes scored" suffix="+" />
      <StatCell value={values.roles} label="curated roles" suffix="+" />
      <StatCell value={values.placements} label="offers landed" suffix="+" />
    </motion.div>
  );
}

function StatCell({ value, label, suffix }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-3xl bg-white px-6 py-8 text-left shadow-sm shadow-stone-200/50">
      <div className="text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl md:text-5xl tabular-nums">
        <NumberFlow value={value} />
        {suffix && <span className="text-brand-400">{suffix}</span>}
      </div>
      <div className="text-xs font-mono uppercase tracking-[0.35em] text-stone-500">
        {label}
      </div>
    </div>
  );
}

StatCell.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  suffix: PropTypes.string,
};

function WinsMarquee() {
  const row = [...WINS, ...WINS];
  return (
    <div className="relative py-6 border-y border-stone-200 bg-stone-50 overflow-hidden" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-stone-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-stone-50 to-transparent" />

      <div className="flex items-center gap-3 px-6 max-w-6xl mx-auto mb-3">
        <span className="text-xs font-mono uppercase tracking-[0.35em] text-stone-500">
          Live · recent wins
        </span>
      </div>

      <motion.div
        className="flex animate-marquee gap-6 whitespace-nowrap px-6"
        initial={{ x: 0 }}
        animate={{ x: [-0, -2400] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {row.map((win, index) => (
          <div key={`${win.name}-${index}`} className="inline-flex min-w-[220px] items-center gap-3 rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
            <span className="font-semibold text-stone-950">{win.name}</span>
            <span className="text-stone-400">·</span>
            <span>{win.role}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export { HeroGeometric };
