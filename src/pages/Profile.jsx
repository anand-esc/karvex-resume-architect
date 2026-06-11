// src/pages/Profile.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";

// --- DND-KIT IMPORTS ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- SORTABLE ITEM WRAPPER (The Draggable Card) ---
const SortableItem = ({ id, onRemove, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative bg-white border ${isDragging ? 'border-[#4338ca] shadow-2xl scale-[1.02]' : 'border-gray-200 shadow-sm'} p-6 rounded-3xl mb-6 flex gap-4 transition-all duration-200`}>
      {/* Drag Handle */}
      <div 
        ref={setActivatorNodeRef} 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#4338ca] flex flex-col items-center pt-2 transition-colors"
        title="Drag to reorder"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
      </div>
      
      {/* Form Content - Added pr-12 here to prevent overlap! */}
      <div className="flex-1 pr-12">
        {children}
      </div>

      {/* Delete Button - Nudged to the corner with a nice hover effect */}
      <button 
        onClick={onRemove}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors p-2"
        title="Remove Item"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
};

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({ fullName: "", headline: "", email: "", phone: "", location: "", about: "", photoURL: "" });
  const [links, setLinks] = useState({ linkedin: "", github: "", portfolio: "" });
  
  const [skills, setSkills] = useState([]); 
  const [skillInput, setSkillInput] = useState("");

  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);

  // DND Sensors (Touch & Mouse support)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/"); return; }
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPersonalInfo(data.personalInfo || {});
          setLinks(data.links || {});
          setSkills(data.skills || []);
          
          const ensureIds = (arr) => arr?.map(item => item.id ? item : { ...item, id: Math.random().toString(36).substring(2, 11) }) || [];
          setExperience(ensureIds(data.experience));
          setProjects(ensureIds(data.projects));
          setEducation(ensureIds(data.education));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const calculateStrength = () => {
    let score = 0;
    if (personalInfo.photoURL) score += 10;
    if (personalInfo.fullName && personalInfo.headline) score += 15;
    if (personalInfo.about && personalInfo.about.length > 20) score += 15;
    if (skills.length > 0) score += 15;
    if (experience.length > 0) score += 20;
    if (projects.length > 0) score += 15;
    if (education.length > 0) score += 10;
    return Math.min(score, 100);
  };
  const strength = calculateStrength();

  const handlePhotoUpload = (url) => setPersonalInfo({ ...personalInfo, photoURL: url });

  const addItem = (setter, stateArray) => {
    setter([...stateArray, { id: Math.random().toString(36).substring(2, 11) }]);
  };

  const updateItem = (setter, stateArray, id, field, value) => {
    setter(stateArray.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter, stateArray, id) => {
    setter(stateArray.filter(item => item.id !== id));
  };

  const handleDragEnd = (event, setter, stateArray) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = stateArray.findIndex((i) => i.id === active.id);
      const newIndex = stateArray.findIndex((i) => i.id === over.id);
      setter(arrayMove(stateArray, oldIndex, newIndex));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      await toast.promise(
        setDoc(doc(db, "users", user.uid), {
          personalInfo,
          links,
          skills,
          experience,
          projects,
          education,
          updatedAt: new Date()
        }),
        {
          loading: 'Supercharging Database...',
          success: 'Master Profile Saved!',
          error: 'Failed to save profile.',
        }
      );
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#4338ca] font-bold tracking-widest uppercase text-sm">Initializing Editor...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans selection:bg-[#4338ca]/20">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-[#eff1ec] sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/home")} className="text-gray-400 hover:text-[#4338ca] transition-colors p-2 rounded-full hover:bg-gray-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-xl font-extrabold tracking-tighter text-[#4338ca]">Master Profile</h1>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`px-6 py-2.5 bg-[#4338ca] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#4338ca]/20 transition-all active:scale-95 ${isSaving ? 'opacity-70' : 'hover:bg-[#3730a3]'}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        
        {/* GAMIFIED PROFILE STRENGTH METER */}
        <div className="bg-white p-6 rounded-3xl border border-[#eff1ec] shadow-sm mb-12 relative overflow-hidden">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-1">Database Intelligence</h2>
              <p className="text-2xl font-extrabold text-gray-900">{strength}% <span className="text-lg text-gray-400 font-medium">Supercharged</span></p>
            </div>
            {strength === 100 && <span className="text-[#4338ca] text-xs font-bold uppercase tracking-widest flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"/></svg> AI Optimized</span>}
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#4338ca] to-[#a5b4fc] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${strength}%` }}
            ></div>
          </div>
          {strength < 100 && <p className="text-xs text-gray-400 mt-4 font-medium">Fill in missing sections to give the AI more context for generation.</p>}
        </div>

        <form className="space-y-12">
          
          {/* PERSONAL INFO SECTION */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#4338ca]/10 text-[#4338ca] flex items-center justify-center text-sm">1</span> 
              Core Identity
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-sm">
              <ProfilePhotoUpload currentPhotoUrl={personalInfo.photoURL} onUploadComplete={handlePhotoUpload} />
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Full Name</label>
                  <input type="text" value={personalInfo.fullName} onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Professional Title</label>
                  <input type="text" value={personalInfo.headline} onChange={e => setPersonalInfo({...personalInfo, headline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Email</label>
                  <input type="email" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Phone</label>
                  <input type="text" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Location</label>
                  <input type="text" value={personalInfo.location} onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium" placeholder="e.g. San Francisco, CA" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">About / Bio</label>
                  <textarea value={personalInfo.about} onChange={e => setPersonalInfo({...personalInfo, about: e.target.value})} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium resize-none" placeholder="A brief summary of your background..." />
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE SKILLS SECTION */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#4338ca]/10 text-[#4338ca] flex items-center justify-center text-sm">2</span> 
              Technical Arsenal
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-[#eff1ec] shadow-sm">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3">Add Skills (Press Enter to add)</label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-[#4338ca]/10 text-[#4338ca] border border-[#4338ca]/20 rounded-lg text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-200">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                      className="hover:text-red-500 transition-colors focus:outline-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const newSkill = skillInput.trim();
                    if (newSkill && !skills.includes(newSkill)) {
                      setSkills([...skills, newSkill]);
                      setSkillInput("");
                    }
                  }
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] outline-none text-sm font-medium transition-all" 
                placeholder="Type a skill (e.g., Python, UI/UX) and press Enter..." 
              />
            </div>
          </section>

          {/* DND EXPERIENCE SECTION */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#4338ca]/10 text-[#4338ca] flex items-center justify-center text-sm">3</span> 
                Experience
              </h2>
              <button type="button" onClick={() => addItem(setExperience, experience)} className="text-sm font-bold text-[#4338ca] hover:underline bg-[#4338ca]/5 px-4 py-2 rounded-lg transition-colors">+ Add Role</button>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setExperience, experience)}>
              <SortableContext items={experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {experience.map((exp) => (
                  <SortableItem key={exp.id} id={exp.id} onRemove={() => removeItem(setExperience, experience, exp.id)}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Company</label>
                        <input type="text" value={exp.company || ""} onChange={e => updateItem(setExperience, experience, exp.id, 'company', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Role Title</label>
                        <input type="text" value={exp.role || ""} onChange={e => updateItem(setExperience, experience, exp.id, 'role', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Start Date</label>
                        <input type="text" value={exp.startDate || ""} onChange={e => updateItem(setExperience, experience, exp.id, 'startDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" placeholder="e.g. Jan 2021" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">End Date</label>
                        <input type="text" value={exp.endDate || ""} onChange={e => updateItem(setExperience, experience, exp.id, 'endDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" placeholder="e.g. Present" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Description & Achievements</label>
                        <textarea value={exp.description || ""} onChange={e => updateItem(setExperience, experience, exp.id, 'description', e.target.value)} rows="3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium resize-none" />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </section>

          {/* DND PROJECTS SECTION */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#4338ca]/10 text-[#4338ca] flex items-center justify-center text-sm">4</span> 
                Projects
              </h2>
              <button type="button" onClick={() => addItem(setProjects, projects)} className="text-sm font-bold text-[#4338ca] hover:underline bg-[#4338ca]/5 px-4 py-2 rounded-lg transition-colors">+ Add Project</button>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setProjects, projects)}>
              <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((proj) => (
                  <SortableItem key={proj.id} id={proj.id} onRemove={() => removeItem(setProjects, projects, proj.id)}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Project Name</label>
                        <input type="text" value={proj.name || ""} onChange={e => updateItem(setProjects, projects, proj.id, 'name', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Tech Stack</label>
                        <input type="text" value={proj.techStack || ""} onChange={e => updateItem(setProjects, projects, proj.id, 'techStack', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" placeholder="React, Firebase, Tailwind" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Description</label>
                        <textarea value={proj.description || ""} onChange={e => updateItem(setProjects, projects, proj.id, 'description', e.target.value)} rows="3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium resize-none" />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </section>

          {/* DND EDUCATION SECTION */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#4338ca]/10 text-[#4338ca] flex items-center justify-center text-sm">5</span> 
                Education
              </h2>
              <button type="button" onClick={() => addItem(setEducation, education)} className="text-sm font-bold text-[#4338ca] hover:underline bg-[#4338ca]/5 px-4 py-2 rounded-lg transition-colors">+ Add Degree</button>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setEducation, education)}>
              <SortableContext items={education.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {education.map((edu) => (
                  <SortableItem key={edu.id} id={edu.id} onRemove={() => removeItem(setEducation, education, edu.id)}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Institution</label>
                        <input type="text" value={edu.institution || ""} onChange={e => updateItem(setEducation, education, edu.id, 'institution', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Degree / Certification</label>
                        <input type="text" value={edu.degree || ""} onChange={e => updateItem(setEducation, education, edu.id, 'degree', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">Start Date</label>
                        <input type="text" value={edu.startDate || ""} onChange={e => updateItem(setEducation, education, edu.id, 'startDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5">End Date</label>
                        <input type="text" value={edu.endDate || ""} onChange={e => updateItem(setEducation, education, edu.id, 'endDate', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-[#4338ca] outline-none text-sm font-medium" />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </section>

        </form>
      </main>
    </div>
  );
};

export default Profile;