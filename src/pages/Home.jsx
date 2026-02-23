// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import JobModal from "../components/JobModal";
import { generateSuperCV } from "../utils/cvGenerator";
import toast from "react-hot-toast";

// --- CUSTOM ANIMATION COMPONENT: Floating Papers ---
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 20 + 15; 
        const left = Math.random() * 100; 
        const delay = Math.random() * 15; 
        const duration = Math.random() * 10 + 15; 
        
        return (
          <svg 
            key={i}
            className="absolute text-white/10"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `-10%`, 
              animation: `fall ${duration}s linear ${delay}s infinite`
            }}
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        );
      })}
    </div>
  );
};

// --- MINIATURE CSS WIREFRAMES (The Previews) ---
const WireframeModernEditorial = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-[30%] bg-slate-800 h-full"></div>
    <div className="w-[70%] p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-full h-1 bg-slate-300 rounded"></div>
      <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded mt-1"></div>
      <div className="w-5/6 h-1 bg-slate-100 rounded"></div>
    </div>
  </div>
);

const WireframeExecutiveDark = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-full h-8 bg-slate-900 flex justify-center items-center">
      <div className="w-1/2 h-1 bg-slate-400 rounded"></div>
    </div>
    <div className="p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-full h-1 bg-slate-300 rounded"></div>
      <div className="w-4/5 h-1 bg-slate-200 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded mt-1"></div>
    </div>
  </div>
);

const WireframeCreativeAccent = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-1.5 bg-purple-600 h-full"></div>
    <div className="flex-1 p-2 flex flex-col gap-1 mt-1">
      <div className="w-2/3 h-1.5 bg-purple-600 rounded mb-1"></div>
      <div className="w-full h-1 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-1 bg-gray-200 rounded"></div>
      <div className="w-full h-1 bg-gray-100 rounded mt-1"></div>
    </div>
  </div>
);

const WireframeClassicAcademic = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col items-center p-2 transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-2/3 h-1.5 bg-gray-800 rounded mb-1 mt-1"></div>
    <div className="w-1/2 h-0.5 bg-gray-400 mb-2"></div>
    <div className="w-full h-0.5 bg-gray-800 mb-1.5"></div>
    <div className="w-full h-1 bg-gray-300 rounded mb-0.5"></div>
    <div className="w-5/6 h-1 bg-gray-300 rounded mb-1"></div>
    <div className="w-full h-0.5 bg-gray-800 mb-1 mt-1"></div>
  </div>
);

const WireframeMidnightTech = () => (
  <div className="w-20 h-28 bg-slate-900 shadow-lg border border-slate-700 overflow-hidden flex flex-col p-2.5 transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-1/2 h-1.5 bg-white rounded mb-1"></div>
    <div className="w-1/3 h-1 bg-emerald-400 rounded mb-2"></div>
    <div className="w-full h-px bg-slate-700 mb-1.5"></div>
    <div className="w-full h-1 bg-slate-500 rounded mb-1"></div>
    <div className="w-4/5 h-1 bg-slate-500 rounded"></div>
  </div>
);

const WireframeSoftPastel = () => (
  <div className="w-20 h-28 bg-white shadow-lg border border-gray-200 overflow-hidden flex flex-col transform group-hover:scale-110 transition-transform duration-500">
    <div className="w-full h-7 bg-rose-100 p-1.5 flex flex-col gap-1">
      <div className="w-1/2 h-1 bg-zinc-600 rounded"></div>
      <div className="w-1/3 h-0.5 bg-rose-500 rounded"></div>
    </div>
    <div className="p-2 flex flex-col gap-1.5 mt-1">
      <div className="w-1/3 h-1 bg-rose-200 rounded mb-0.5"></div>
      <div className="w-full h-1 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-1 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const Home = () => {
  const [userName, setUserName] = useState("Professional");
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/"); 
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.personalInfo?.fullName || "User");
          setUserPhoto(data.personalInfo?.photoURL || null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
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
            loading: 'Analyzing JD & Crafting Super CV...',
            success: `✨ Tailored CV for ${jobData.company} downloaded!`,
            error: 'Failed to generate CV. Please check console.',
          }
        );
      } else {
        toast.error("Please complete your profile in 'Onboarding' first.");
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast.error("Error generating CV. Check console for details.");
    }
  };

  // --- EXPANDED 6-TEMPLATE LIBRARY WITH WIREFRAMES ---
  const templates = [
    { id: 1, name: "Modern Editorial", bg: "bg-blue-50/50", icon: <WireframeModernEditorial />, desc: "Clean, classic, and highly readable." },
    { id: 2, name: "Executive Dark", bg: "bg-gray-100/50", icon: <WireframeExecutiveDark />, desc: "High-contrast header for tech roles." },
    { id: 3, name: "Creative Accent", bg: "bg-purple-50/50", icon: <WireframeCreativeAccent />, desc: "Vibrant stripe for modern startups." },
    { id: 4, name: "Classic Academic", bg: "bg-stone-50/50", icon: <WireframeClassicAcademic />, desc: "Traditional serif format for finance & law." },
    { id: 5, name: "Midnight Tech", bg: "bg-slate-800/50", icon: <WireframeMidnightTech />, desc: "Full dark mode with neon emerald accents." },
    { id: 6, name: "Soft Pastel", bg: "bg-rose-50/50", icon: <WireframeSoftPastel />, desc: "Warm, elegant, and highly spacious design." },
  ];

  if (loading) return <div className="min-h-screen bg-[#fcfcfb] flex items-center justify-center text-[#556b2f] font-bold tracking-widest uppercase text-sm">Loading Core...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfb] font-sans">
      
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
          }
        `}
      </style>

      {/* TOP NAVBAR */}
      <div className="w-full bg-[#fcfcfb] px-6 md:px-12 py-6">
        <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-[#556b2f]">KARVEX</h1>
            <p className="text-gray-500 text-sm font-medium">Welcome back, {userName.split(" ")[0]}</p>
          </div>
          
          <div className="flex gap-6 items-center">
            <div 
              onClick={() => navigate("/profile")}
              className="w-12 h-12 rounded-full border-2 border-[#eff1ec] hover:border-[#556b2f] cursor-pointer overflow-hidden transition-all shadow-sm bg-white flex items-center justify-center z-20 relative"
              title="Master Profile"
            >
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#556b2f] font-bold text-xl">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button 
              onClick={() => {
                auth.signOut().then(() => {
                  toast.success("Signed out successfully");
                  navigate("/");
                });
              }}
              className="text-[10px] font-bold uppercase text-gray-400 tracking-wider hover:text-red-500 transition-colors z-20 relative"
            >
              Sign Out
            </button>
          </div>
        </header>
      </div>

      {/* THE ANIMATED DARK HERO SECTION */}
      <div className="relative w-full bg-[#182110] pt-24 pb-48 overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 text-white/90 text-[10px] font-bold tracking-widest uppercase border border-white/20 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            AI-Powered Career Intelligence
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Architect Your <br className="hidden md:block" /> Professional Narrative.
          </h2>
          <p className="text-lg text-white/60 leading-relaxed font-medium">
            KARVEX is an editorial resume core designed to bridge the gap between your raw data and the specific requirements of your target role. Stop sending generic resumes. Let our AI tailor your narrative to perfection.
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6">
        
        {/* 3-STEP GUIDE WITH NEW NEON GLOW HOVER PHYSICS */}
        <div className="relative z-20 -mt-24 mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-xl shadow-gray-200/50 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:border-green-400 transition-all duration-300">
              <div className="text-[#556b2f] font-extrabold text-4xl mb-4 opacity-20 group-hover:text-green-500 group-hover:opacity-40 transition-colors">01</div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-2">The Master Profile</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Build your foundational database. The richer and more detailed your Master Profile is, the better our AI understands your unique value proposition.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-xl shadow-gray-200/50 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:border-green-400 transition-all duration-300">
              <div className="text-[#556b2f] font-extrabold text-4xl mb-4 opacity-20 group-hover:text-green-500 group-hover:opacity-40 transition-colors">02</div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-2">Target The Role</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Provide the exact Job Description (JD) you are applying for. KARVEX analyzes the keywords, aligns your skills, and writes a highly targeted summary.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-xl shadow-gray-200/50 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:border-green-400 transition-all duration-300">
              <div className="text-[#556b2f] font-extrabold text-4xl mb-4 opacity-20 group-hover:text-green-500 group-hover:opacity-40 transition-colors">03</div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-2">Generate & Win</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select from our premium architectural layouts below and instantly download your highly tailored, ATS-optimized PDF resume.
              </p>
            </div>
          </div>
        </div>

        {/* TEMPLATE ACTION SECTION WITH WIREFRAMES */}
        <div className="border-t border-[#eff1ec] pt-20 pb-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Select Your Architecture</h2>
            <p className="text-gray-500 font-medium text-sm">Choose a layout to begin the generation sequence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white rounded-3xl overflow-hidden border border-[#eff1ec] shadow-xl shadow-gray-200/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/80 transition-all duration-300 group flex flex-col cursor-pointer"
                onClick={() => handleTemplateClick(template)}
              >
                {/* WIREFRAME PREVIEW AREA */}
                <div className={`h-56 ${template.bg} flex items-center justify-center border-b border-[#eff1ec] relative overflow-hidden`}>
                  {template.icon}
                </div>
                
                <div className="p-8 flex flex-col flex-grow text-center">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-grow">{template.desc}</p>
                  
                  <button className="w-full py-3 bg-gray-50 group-hover:bg-[#556b2f] text-gray-700 group-hover:text-white border border-gray-200 group-hover:border-[#556b2f] rounded-xl text-sm font-bold transition-all shadow-sm">
                    Select Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#eff1ec] mt-12 py-10 text-center flex flex-col items-center">
        <h1 className="text-2xl font-extrabold tracking-tighter text-[#556b2f] opacity-40 mb-2">KARVEX</h1>
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} Editorial Resume Core.
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