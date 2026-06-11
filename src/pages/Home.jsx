// src/pages/Home.jsx — Authenticated dashboard
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import JobModal from "../components/JobModal";
import { generateSuperCV } from "../utils/cvGenerator";
import toast from "react-hot-toast";

// ─── Miniature CSS Wireframes ──────────────────────────────────────────────────
const WireframeModernEditorial = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-[30%] bg-slate-800 h-full" />
    <div className="w-[70%] p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-full h-1 bg-slate-300 rounded" />
      <div className="w-3/4 h-1 bg-slate-200 rounded" />
      <div className="w-full h-1 bg-slate-100 rounded mt-1" />
      <div className="w-5/6 h-1 bg-slate-100 rounded" />
    </div>
  </div>
);

const WireframeExecutiveDark = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-full h-8 bg-slate-900 flex justify-center items-center">
      <div className="w-1/2 h-1 bg-slate-400 rounded" />
    </div>
    <div className="p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-full h-1 bg-slate-300 rounded" />
      <div className="w-4/5 h-1 bg-slate-200 rounded" />
      <div className="w-full h-1 bg-slate-100 rounded mt-1" />
    </div>
  </div>
);

const WireframeCreativeAccent = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-1.5 bg-purple-600 h-full" />
    <div className="flex-1 p-2 flex flex-col gap-1 mt-1">
      <div className="w-2/3 h-1.5 bg-purple-600 rounded mb-1" />
      <div className="w-full h-1 bg-gray-200 rounded" />
      <div className="w-5/6 h-1 bg-gray-200 rounded" />
      <div className="w-full h-1 bg-gray-100 rounded mt-1" />
    </div>
  </div>
);

const WireframeClassicAcademic = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center p-2 transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-2/3 h-1.5 bg-gray-800 rounded mb-1 mt-1" />
    <div className="w-1/2 h-0.5 bg-gray-400 mb-2" />
    <div className="w-full h-0.5 bg-gray-800 mb-1.5" />
    <div className="w-full h-1 bg-gray-300 rounded mb-0.5" />
    <div className="w-5/6 h-1 bg-gray-300 rounded mb-1" />
    <div className="w-full h-0.5 bg-gray-800 mb-1 mt-1" />
  </div>
);

const WireframeMidnightTech = () => (
  <div className="w-20 h-28 bg-slate-900 shadow-lg border border-slate-700 overflow-hidden flex flex-col p-2.5 transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-1/2 h-1.5 bg-white rounded mb-1" />
    <div className="w-1/3 h-1 bg-sky-400 rounded mb-2" />
    <div className="w-full h-px bg-slate-700 mb-1.5" />
    <div className="w-full h-1 bg-slate-500 rounded mb-1" />
    <div className="w-4/5 h-1 bg-slate-500 rounded" />
  </div>
);

const WireframeSoftPastel = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-full h-7 bg-rose-100 p-1.5 flex flex-col gap-1">
      <div className="w-1/2 h-1 bg-zinc-600 rounded" />
      <div className="w-1/3 h-0.5 bg-rose-500 rounded" />
    </div>
    <div className="p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-1/3 h-1 bg-rose-200 rounded mb-0.5" />
      <div className="w-full h-1 bg-gray-200 rounded" />
      <div className="w-5/6 h-1 bg-gray-200 rounded" />
    </div>
  </div>
);

// ─── Main Dashboard Component ──────────────────────────────────────────────────
const Home = () => {
  const [userName, setUserName] = useState("Professional");
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.personalInfo?.fullName || user.displayName || "User");
          setUserPhoto(data.personalInfo?.photoURL || user.photoURL || null);
        } else {
          setUserName(user.displayName || "User");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleGenerateCV = async (jobData) => {
    setIsModalOpen(false);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fullUserProfile = docSnap.data();
        await toast.promise(
          generateSuperCV(fullUserProfile, jobData, selectedTemplate.id),
          {
            loading: "Analyzing JD & Crafting Super CV...",
            success: `✨ Tailored CV for ${jobData.company} downloaded!`,
            error: "Failed to generate CV. Please check console.",
          }
        );
      } else {
        toast.error("Please complete your profile in Onboarding first.");
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast.error("Error generating CV. Check console for details.");
    }
  };

  const templates = [
    // 1-PAGE RESUMES
    { id: 1, name: "Modern Editorial", type: "single", bg: "bg-blue-50/50", icon: <WireframeModernEditorial />, desc: "Clean, classic 1-page layout." },
    { id: 2, name: "Executive Dark", type: "single", bg: "bg-gray-100/50", icon: <WireframeExecutiveDark />, desc: "High-contrast 1-page header for tech roles." },
    { id: 3, name: "Creative Accent", type: "single", bg: "bg-purple-50/50", icon: <WireframeCreativeAccent />, desc: "Bold sidebar accent for design roles." },
    { id: 4, name: "Classic Academic", type: "single", bg: "bg-stone-50/50", icon: <WireframeClassicAcademic />, desc: "Traditional 1-page serif format." },
    { id: 5, name: "Midnight Tech", type: "single", bg: "bg-slate-800/50", icon: <WireframeMidnightTech />, desc: "Full dark mode 1-page tech layout." },
    { id: 6, name: "Soft Pastel", type: "single", bg: "bg-rose-50/50", icon: <WireframeSoftPastel />, desc: "Elegant and minimal 1-page pastel theme." },
    // 2-PAGE CVs
    { id: 7, name: "Modern Editorial CV", type: "double", bg: "bg-blue-50/50", icon: <WireframeModernEditorial />, desc: "Clean, classic 2-page CV layout." },
    { id: 8, name: "Executive Dark CV", type: "double", bg: "bg-gray-100/50", icon: <WireframeExecutiveDark />, desc: "High-contrast 2-page CV for leaders." },
    { id: 9, name: "Classic Academic CV", type: "double", bg: "bg-stone-50/50", icon: <WireframeClassicAcademic />, desc: "Traditional 2-page serif CV." },
    { id: 10, name: "Midnight Tech CV", type: "double", bg: "bg-slate-800/50", icon: <WireframeMidnightTech />, desc: "Full dark mode 2-page tech CV." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#4338ca]/20 border-t-[#4338ca] rounded-full animate-spin" />
          <span className="text-[#4338ca] text-xs font-bold tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">

      {/* ─── TOP NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#f8fafc]/80 backdrop-blur-md border-b border-[#eff1ec] px-6 md:px-12 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tighter text-[#4338ca]">KARVEX</h1>
            <p className="text-gray-400 text-xs font-medium">Welcome back, {userName.split(" ")[0]}</p>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/onboarding")}
              className="text-xs font-bold text-gray-400 hover:text-[#4338ca] transition-colors uppercase tracking-wider hidden sm:block"
            >
              Edit Profile
            </button>
            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full border-2 border-[#eff1ec] hover:border-[#4338ca] cursor-pointer overflow-hidden transition-all shadow-sm bg-white flex items-center justify-center"
              title="Master Profile"
            >
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#4338ca] font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => auth.signOut().then(() => { toast.success("Signed out"); navigate("/"); })}
              className="text-[10px] font-bold uppercase text-gray-400 tracking-wider hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#0f172a] pt-20 pb-40 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => {
            const size = Math.random() * 18 + 12;
            const left = Math.random() * 100;
            const delay = Math.random() * 15;
            const duration = Math.random() * 10 + 15;
            return (
              <svg
                key={i}
                className="absolute text-white/8"
                style={{ width: `${size}px`, height: `${size}px`, left: `${left}%`, top: "-10%", animation: `fall ${duration}s linear ${delay}s infinite` }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            );
          })}
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 text-white/90 text-[10px] font-bold tracking-widest uppercase border border-white/20 backdrop-blur-sm">
            AI-Powered Career Intelligence
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Architect Your <br className="hidden md:block" /> Professional Narrative.
          </h2>
          <p className="text-base text-white/55 leading-relaxed font-medium max-w-2xl mx-auto">
            KARVEX bridges the gap between your raw experience and the exact requirements of your target role. Select a template below to generate your AI-tailored PDF in seconds.
          </p>
        </div>
      </section>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 -mt-20 relative z-10">

        {/* ─── 3-STEP GUIDE ─── */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { n: "01", title: "The Master Profile", desc: "Build your foundational data. The richer your profile, the better our AI understands your unique value." },
            { n: "02", title: "Target The Role", desc: "Paste the Job Description. KARVEX analyzes keywords and aligns your skills to the role requirements." },
            { n: "03", title: "Generate & Win", desc: "Select a template and instantly download your ATS-optimized, AI-tailored PDF resume." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-xl shadow-gray-200/50 group hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(85,107,47,0.2)] hover:border-[#4338ca]/30 transition-all duration-300">
              <div className="text-[#4338ca] font-extrabold text-4xl mb-4 opacity-20 group-hover:opacity-40 transition-opacity">{n}</div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ─── RESUME VS CV GUIDE ─── */}
        <div className="border-t border-[#eff1ec] pt-16 pb-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Best Practices: Resume vs CV</h2>
            <p className="text-gray-400 font-medium text-sm">Understand which format fits your career stage.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div className="bg-sky-50/60 p-8 rounded-3xl border border-sky-100">
              <h3 className="text-xl font-bold text-sky-800 mb-3">1-Page Resume — The Gold Standard</h3>
              <p className="text-sm text-sky-700 leading-relaxed mb-4">Ideal for students, recent graduates, and early-career professionals. Forces ruthless editing.</p>
              <ul className="text-sm text-sky-700 space-y-2 list-disc pl-5">
                <li><strong>Ditch the Summary:</strong> Let projects & skills do the talking.</li>
                <li><strong>Strict Relevance:</strong> Cut older or irrelevant experiences.</li>
                <li><strong>Highlight Reel:</strong> Focus heavily on your top 2–4 projects.</li>
              </ul>
            </div>
            <div className="bg-blue-50/60 p-8 rounded-3xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800 mb-3">2-Page CV — The Comprehensive Profile</h3>
              <p className="text-sm text-blue-700 leading-relaxed mb-4">Ideal for experienced professionals, researchers, or those with an extensive portfolio.</p>
              <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                <li><strong>Professional Summary:</strong> A 3–5 sentence elevator pitch.</li>
                <li><strong>Extensive Sections:</strong> Publications, Certifications, Extracurriculars.</li>
                <li><strong>Split Intelligently:</strong> Never split a single job entry across pages.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── TEMPLATE LIBRARY ─── */}
        <div className="pb-20 border-t border-[#eff1ec] pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Select Your Architecture</h2>
            <p className="text-gray-400 font-medium text-sm">Choose a layout to begin the generation sequence.</p>
          </div>

          <div className="space-y-14">
            {/* Single-page */}
            <div>
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">1-Page Resumes</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.filter(t => t.type === "single").map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="bg-white rounded-2xl overflow-hidden border border-[#eff1ec] shadow-lg hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#4338ca]/10 hover:border-[#4338ca]/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div className={`h-48 ${template.bg} flex items-center justify-center border-b border-[#eff1ec]`}>{template.icon}</div>
                    <div className="p-6 text-center">
                      <h3 className="text-base font-bold mb-1 text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">{template.desc}</p>
                      <button className="w-full py-2.5 bg-gray-50 group-hover:bg-[#4338ca] text-gray-600 group-hover:text-white border border-gray-200 group-hover:border-[#4338ca] rounded-xl text-xs font-bold transition-all">
                        Select Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Double-page */}
            <div>
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">2-Page CVs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {templates.filter(t => t.type === "double").map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="bg-white rounded-2xl overflow-hidden border border-[#eff1ec] shadow-lg hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#4338ca]/10 hover:border-[#4338ca]/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div className={`h-48 ${template.bg} flex items-center justify-center border-b border-[#eff1ec]`}>{template.icon}</div>
                    <div className="p-6 text-center">
                      <h3 className="text-base font-bold mb-1 text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">{template.desc}</p>
                      <button className="w-full py-2.5 bg-gray-50 group-hover:bg-[#4338ca] text-gray-600 group-hover:text-white border border-gray-200 group-hover:border-[#4338ca] rounded-xl text-xs font-bold transition-all">
                        Select Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#eff1ec] py-8 text-center">
        <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">
          KARVEX · © {new Date().getFullYear()} Editorial Resume Core
        </p>
      </footer>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateCV}
        templateName={selectedTemplate?.name}
      />
    </div>
  );
};

export default Home;