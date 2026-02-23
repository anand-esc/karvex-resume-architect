// src/components/JobModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// ✅ FIX 1: Using Vite Environment Variable securely
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const JobModal = ({ isOpen, onClose, onSubmit, templateName }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input');
  const [jobData, setJobData] = useState({ role: '', company: '', description: '' });
  const [analysis, setAnalysis] = useState({ score: 0, missingKeywords: [], reasoning: '' });

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobData.description || !jobData.role) {
      toast.error("Role and Description are required.");
      return;
    }

    setStep('analyzing');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (!docSnap.exists()) throw new Error("Profile not found");
      const profile = docSnap.data();

      const userSkills = profile?.skills ? profile.skills.join(', ') : "";
      const userExp = profile?.experience ? profile.experience.map(exp => exp.description || '').join(' ') : "";
      const userProj = profile?.projects ? profile.projects.map(p => p.description || '').join(' ') : "";

      // ✅ FIX 2: Updated to the current stable model to prevent 404 errors
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are a strict Applicant Tracking System (ATS) for recruiters.
        
        Job Role: "${jobData.role}"
        Job Description: "${jobData.description}"
        
        Candidate Skills: "${userSkills}"
        Candidate Experience & Projects: "${userExp} ${userProj}"

        Analyze how well the candidate matches the job description. Find the missing hard skills, tools, or critical keywords.
        
        RETURN STRICTLY THIS JSON FORMAT AND NOTHING ELSE. DO NOT USE MARKDOWN TICKS:
        {
          "score": 85,
          "missingKeywords": ["keyword1", "keyword2"],
          "reasoning": "A short 1-sentence explanation of why they got this score."
        }
      `;

      const result = await model.generateContent(prompt);
      
      let rawText = result.response.text();
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const aiResponse = JSON.parse(rawText);
      
      setAnalysis(aiResponse);
      setStep('results');

    } catch (error) {
      console.error("ATS Analysis Failed:", error);
      toast.error("Analysis failed. Proceeding to generation.");
      onSubmit(jobData);
      resetModal();
    }
  };

  const resetModal = () => {
    setStep('input');
    setJobData({ role: '', company: '', description: '' });
    onClose();
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const safeScore = analysis?.score || 0; 
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-rose-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-[#eff1ec] flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-extrabold text-[#556b2f] tracking-tight">Target Role Configuration</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Layout: {templateName}</p>
          </div>
          <button onClick={resetModal} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          
          {step === 'input' && (
            <form id="job-form" onSubmit={handleAnalyze} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Target Role</label>
                  <input type="text" value={jobData.role} onChange={(e) => setJobData({...jobData, role: e.target.value})} placeholder="e.g. Frontend Dev" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none text-sm font-medium transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Company</label>
                  <input type="text" value={jobData.company} onChange={(e) => setJobData({...jobData, company: e.target.value})} placeholder="e.g. Google" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none text-sm font-medium transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Job Description (JD)</label>
                <textarea value={jobData.description} onChange={(e) => setJobData({...jobData, description: e.target.value})} placeholder="Paste the full job description here. Our AI will analyze the keywords..." rows="6" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#556b2f]/20 focus:border-[#556b2f] outline-none text-sm font-medium resize-none transition-all" required />
              </div>
            </form>
          )}

          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#556b2f] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#556b2f]">
                  <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Running ATS Scan...</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Cross-referencing your Master Profile with the specific requirements of the {jobData.company} Job Description.</p>
            </div>
          )}

          {step === 'results' && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
              
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle 
                    cx="64" cy="64" r={radius} 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`${getScoreColor(safeScore)} transition-all duration-1000 ease-out`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-black ${getScoreColor(safeScore)}`}>{safeScore}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Match</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 font-medium mb-6 px-4">"{analysis.reasoning}"</p>

              {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                <div className="w-full bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-2 text-left">
                  <p className="text-xs font-bold uppercase text-rose-500 tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Critical Missing Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 rounded-md text-xs font-bold shadow-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-2 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-sm font-bold text-emerald-700">Perfect keyword alignment!</span>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="p-6 border-t border-[#eff1ec] bg-gray-50/50">
          {step === 'input' && (
            <button form="job-form" type="submit" className="w-full py-3.5 bg-[#556b2f] text-white rounded-xl font-bold shadow-lg shadow-[#556b2f]/20 hover:bg-[#3e4f22] transition-all flex items-center justify-center gap-2 active:scale-95">
              <svg className="w-5 h-5 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
              Run ATS Pre-Flight Check
            </button>
          )}

          {step === 'results' && (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  resetModal();
                  navigate('/profile');
                }} 
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                Update Profile
              </button>
              <button 
                onClick={() => {
                  setStep('analyzing'); 
                  onSubmit(jobData);
                  setTimeout(() => { resetModal(); }, 1500); 
                }} 
                className="flex-1 py-3 bg-[#556b2f] text-white rounded-xl font-bold shadow-lg shadow-[#556b2f]/20 hover:bg-[#3e4f22] transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                Generate Anyway
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobModal;