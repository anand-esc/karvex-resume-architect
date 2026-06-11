// src/pages/Onboarding.jsx
import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";

const Onboarding = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    title: "", 
    skills: "", 
    experience: "", 
    photoURL: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (url) => {
    setFormData({ ...formData, photoURL: url });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const skillsArray = formData.skills.split(",").map(s => s.trim());

      await setDoc(doc(db, "users", user.uid), {
        personalInfo: {
          fullName: formData.fullName,
          email: user.email,
          photoURL: formData.photoURL,
        },
        professional: {
          title: formData.title,
          summary: formData.experience,
          skills: skillsArray,
        }
      });

      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans text-gray-800">
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-[#eff1ec]">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#4338ca] tracking-tight mb-2">Build Your Master Profile</h1>
          <p className="text-gray-500 text-sm">KARVEX uses this data to auto-generate your Super CVs. Fill it once, use it forever.</p>
        </div>

        <form onSubmit={saveProfile} className="space-y-6">
          
          {/* Profile Photo Component */}
          <div className="flex justify-center mb-8">
            <ProfilePhotoUpload 
              currentPhotoUrl={formData.photoURL} 
              onUploadComplete={handlePhotoUpload} 
            />
          </div>
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/10 focus:border-[#4338ca] outline-none transition-all text-sm"
              placeholder="e.g. Alex Rivera"
              required
            />
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Current Job Title / Role</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/10 focus:border-[#4338ca] outline-none transition-all text-sm"
              placeholder="e.g. Full Stack Developer"
              required
            />
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Skills (Comma Separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/10 focus:border-[#4338ca] outline-none transition-all text-sm h-24"
              placeholder="e.g. React, Node.js, Python, Machine Learning"
              required
            />
          </div>

          {/* Experience Summary */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Professional Summary</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/10 focus:border-[#4338ca] outline-none transition-all text-sm h-32"
              placeholder="Briefly describe your experience..."
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 bg-[#4338ca] text-white font-bold rounded-xl transform transition-all active:scale-95 shadow-lg shadow-[#4338ca]/20 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#3730a3]'}`}
          >
            {loading ? "Saving..." : "Save & Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;