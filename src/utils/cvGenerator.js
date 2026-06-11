// src/utils/cvGenerator.js
import { jsPDF } from "jspdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Use LangChain model
const getModel = () => new ChatGoogleGenerativeAI({
  modelName: "gemini-2.5-flash",
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  maxRetries: 2,
});

const cleanUrl = (url) => {
  if (!url) return "";
  let clean = url.replace(/^https?:\/\/(www\.)?/, ''); 
  clean = clean.split('?')[0]; 
  clean = clean.replace(/\/$/, ''); 
  return clean;
};

export const generateSuperCV = async (userProfile, jobData, templateId) => {
  const isTwoPage = templateId >= 7;
  const doc = new jsPDF();
  const { role, company, description } = jobData;
  
  const { personalInfo, links, skills, experience: rawExperience, education, projects: rawProjects } = userProfile;

  let aiSummary = "";
  let finalExperience = [...rawExperience];
  let finalProjects = [...rawProjects];

  // --- 1. THE EXPANDED AI BRAIN (JSON REWRITER WITH LANGCHAIN) ---
  try {
    const model = getModel();
    
    const outputSchema = z.object({
      summary: z.string().describe("Tailored, professional 3-sentence resume summary highlighting exact skills matching the JD. Do not use 'I' or 'my'."),
      rewrittenExperiences: z.array(z.object({
        id: z.string().describe("The exact ID from the input"),
        description: z.string().describe("Rewritten bullet points aligned with JD keywords, metric-driven and action-oriented.")
      })),
      rewrittenProjects: z.array(z.object({
        id: z.string().describe("The exact ID from the input"),
        description: z.string().describe("Rewritten bullet points aligned with JD keywords, metric-driven and action-oriented.")
      }))
    });

    const structuredLlm = model.withStructuredOutput(outputSchema);

    // Multimodal or Text Content for JD
    let jdContent = [];
    if (jobData.image) {
      jdContent = [
        { type: "text", text: `Applying for: "${role}" at "${company}". \nHere is an image of the Job Description:` },
        { type: "image_url", image_url: { url: jobData.image } } // jobData.image should be a base64 data URL
      ];
    } else {
      jdContent = [
        { type: "text", text: `Applying for: "${role}" at "${company}".\nJob Description: "${description}"` }
      ];
    }

    const messages = [
      new SystemMessage(`You are an elite ATS resume writer. 
Candidate Name: ${personalInfo.fullName}.
Title: ${personalInfo.headline}.
Skills: ${skills.join(", ")}.

Candidate's Raw Experience:
${JSON.stringify(rawExperience.map(e => ({ id: e.company + e.role, description: e.description })))}

Candidate's Raw Projects:
${JSON.stringify(rawProjects.map(p => ({ id: p.name, description: p.description })))}

INSTRUCTIONS:
1. Write a tailored, professional 3-sentence resume summary. Highlight exact skills matching the JD. Do not use "I" or "my".
2. Rewrite the Candidate's Experience and Project descriptions. Enhance the phrasing to align perfectly with the target Job Description keywords. Make them impactful, metric-driven, and action-oriented. DO NOT hallucinate new jobs or projects, just elevate the writing of the existing ones.
`),
      new HumanMessage({ content: jdContent })
    ];
    
    // Structured output automatically parses JSON and retries on failure (LangChain handles this natively with Gemini)
    const aiResponse = await structuredLlm.invoke(messages);
    
    aiSummary = aiResponse.summary || "";
    
    if (aiResponse.rewrittenExperiences) {
      finalExperience = rawExperience.map(exp => {
        const matched = aiResponse.rewrittenExperiences.find(ai => ai.id === exp.company + exp.role);
        return { ...exp, description: matched ? matched.description : exp.description };
      });
    }

    if (aiResponse.rewrittenProjects) {
      finalProjects = rawProjects.map(proj => {
        const matched = aiResponse.rewrittenProjects.find(ai => ai.id === proj.name);
        return { ...proj, description: matched ? matched.description : proj.description };
      });
    }

  } catch (error) {
    console.error("LangChain AI Formatting Error (Falling back to raw data):", error);
    aiSummary = `Innovative ${personalInfo.headline} with expertise in ${skills.slice(0, 4).join(", ")}. Proven ability to build impactful solutions, seeking to drive success as a ${role} at ${company}.`; 
  }

  // Optimize skill order based on JD keywords
  const jdKeywords = description.toLowerCase().split(/[\s,]+/);
  const sortedSkills = [...skills].sort((a, b) => jdKeywords.includes(b.toLowerCase()) - jdKeywords.includes(a.toLowerCase()));

  const pageHeight = 297; 
  const pageWidth = 210;

  // ==========================================
  // TEMPLATE 1: MODERN BLUE
  // ==========================================
  const renderModernBlue = () => {
    const sidebarWidth = 75;
    const mainX = sidebarWidth + 10;
    const mainWidth = pageWidth - sidebarWidth - 20;

    const drawSidebarBackground = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, sidebarWidth, pageHeight, "F");
    };
    drawSidebarBackground();

    let sideY = 25;
    doc.setFillColor(203, 213, 225);
    doc.circle(sidebarWidth / 2, sideY, 15, "F");
    doc.setFontSize(14); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold");
    const initials = personalInfo.fullName ? personalInfo.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "CV";
    doc.text(initials, sidebarWidth / 2, sideY + 2, { align: "center" });

    sideY += 25;
    doc.setFontSize(16); doc.setTextColor(255, 255, 255);
    doc.text(personalInfo.fullName || "Your Name", sidebarWidth / 2, sideY, { align: "center" });
    sideY += 6;
    doc.setFontSize(10); doc.setTextColor(203, 213, 225); doc.setFont("helvetica", "normal");
    doc.text(role || personalInfo.headline, sidebarWidth / 2, sideY, { align: "center" });
    sideY += 15;

    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("Contact", 10, sideY);
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5); doc.line(10, sideY + 2, sidebarWidth - 10, sideY + 2);
    sideY += 10;

    doc.setFontSize(9); doc.setTextColor(203, 213, 225); doc.setFont("helvetica", "normal");
    const contactItems = [personalInfo.email, personalInfo.phone, personalInfo.location, cleanUrl(links.linkedin), cleanUrl(links.github), cleanUrl(links.portfolio)].filter(Boolean);
    contactItems.forEach(item => {
      const splitItem = doc.splitTextToSize(item, sidebarWidth - 20); 
      doc.text(splitItem, 10, sideY); sideY += (splitItem.length * 5) + 2;
    });
    sideY += 6;

    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
    doc.text("Skills", 10, sideY);
    doc.setDrawColor(79, 70, 229); doc.line(10, sideY + 2, sidebarWidth - 10, sideY + 2);
    sideY += 10;

    let skillX = 10; doc.setFontSize(8);
    sortedSkills.forEach(skill => {
      const textWidth = doc.getTextWidth(skill);
      if (skillX + textWidth + 6 > sidebarWidth - 10) { skillX = 10; sideY += 8; }
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(skillX, sideY - 4, textWidth + 6, 6, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(skill, skillX + 3, sideY);
      skillX += textWidth + 8;
    });

    let mainY = 20;
    let pageCount = 1;

    const checkPageBreak = (needed) => {
      if (mainY + needed > pageHeight - 15) { 
        if (!isTwoPage || pageCount >= 2) return false; // STRICT LIMIT
        doc.addPage();
        pageCount++;
        drawSidebarBackground();
        mainY = 20;

        doc.setFontSize(11); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold");
        doc.text(`${personalInfo.fullName.toUpperCase()} | PAGE 2`, mainX, mainY);
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(mainX, mainY + 3, mainX + mainWidth, mainY + 3);
        mainY += 15;
      }
      return true;
    };

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(14); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.text(title, mainX, mainY);
      doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.5); doc.line(mainX, mainY + 2, mainX + mainWidth, mainY + 2);
      mainY += 10;
      return true;
    };

    if (drawHeader("Profile")) {
      doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(aiSummary, mainWidth);
      doc.text(splitSummary, mainX, mainY); mainY += (splitSummary.length * 5) + 8;
    }

    if (finalExperience.length > 0 && drawHeader("Experience")) {
      for (const exp of finalExperience) {
        doc.setFontSize(9);
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, mainWidth - 5) : [];
        const blockHeight = 14 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break; // STRICT LIMIT

        doc.setFontSize(11); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.text(exp.role, mainX, mainY);
        doc.setFontSize(9); doc.setTextColor(79, 70, 229); doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, mainX, mainY + 5);
        if (splitDesc.length > 0) {
          doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, mainX + 2, mainY + 11 + (i * 5)));
          mainY += 14 + (splitDesc.length * 5);
        } else { mainY += 12; }
      }
    }

    if (finalProjects.length > 0 && drawHeader("Projects")) {
      for (const proj of finalProjects) {
        doc.setFontSize(9);
        const splitDesc = proj.description ? doc.splitTextToSize(proj.description, mainWidth - 5) : [];
        const blockHeight = 14 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break; // STRICT LIMIT

        doc.setFontSize(11); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.text(proj.name, mainX, mainY);
        if (proj.techStack) { doc.setFontSize(9); doc.setTextColor(79, 70, 229); doc.setFont("helvetica", "italic"); doc.text(proj.techStack, mainX, mainY + 5); }
        if (splitDesc.length > 0) {
          doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, mainX + 2, mainY + 11 + (i * 5)));
          mainY += 14 + (splitDesc.length * 5);
        } else { mainY += 12; }
      }
    }

    if (education.length > 0 && drawHeader("Education")) {
      for (const edu of education) {
        if (!checkPageBreak(15)) break; // STRICT LIMIT
        doc.setFontSize(10); doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.text(edu.degree, mainX, mainY);
        doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal"); doc.text(`${edu.institution} (${edu.startDate} - ${edu.endDate})`, mainX, mainY + 5);
        mainY += 12;
      }
    }
  };

  // ==========================================
  // TEMPLATE 2: EXECUTIVE DARK
  // ==========================================
  const renderExecutiveDark = () => {
    let y = 0;
    const marginX = 20; const contentWidth = pageWidth - 40;

    doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageWidth, 55, "F");
    
    y = 25; doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(24);
    doc.text(personalInfo.fullName.toUpperCase(), pageWidth / 2, y, { align: "center" });
    
    y += 8; doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
    doc.text((role || personalInfo.headline).toUpperCase(), pageWidth / 2, y, { align: "center" });

    y += 10; doc.setFontSize(9);
    const contactItems = [personalInfo.email, personalInfo.phone, cleanUrl(links.linkedin), cleanUrl(links.github)].filter(Boolean);
    doc.text(contactItems.join("  |  "), pageWidth / 2, y, { align: "center" });

    y = 65;
    let pageCount = 1;

    const checkPageBreak = (needed) => {
      if (y + needed > pageHeight - 20) {
        if (!isTwoPage || pageCount >= 2) return false; // STRICT LIMIT
        doc.addPage();
        pageCount++;
        y = 20;

        // Page 2 Header
        doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
        doc.text(`${personalInfo.fullName.toUpperCase()} | PAGE 2`, marginX, y);
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(marginX, y + 3, pageWidth - marginX, y + 3);
        y += 15;
      }
      return true;
    };

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), marginX, y);
      doc.setDrawColor(15, 23, 42); doc.setLineWidth(1); doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
      y += 10;
      return true;
    };

    if (drawHeader("Professional Summary")) {
      doc.setFontSize(10); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(aiSummary, contentWidth);
      doc.text(splitSummary, marginX, y); y += (splitSummary.length * 5) + 8;
    }

    if (sortedSkills.length > 0 && drawHeader("Core Competencies")) {
      doc.setFontSize(10); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold");
      const skillsText = doc.splitTextToSize(sortedSkills.join(" • "), contentWidth);
      doc.text(skillsText, marginX, y); y += (skillsText.length * 5) + 8;
    }

    if (finalExperience.length > 0 && drawHeader("Experience")) {
      for (const exp of finalExperience) {
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break; // STRICT LIMIT

        doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.text(exp.role, marginX, y);
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`${exp.startDate} - ${exp.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "italic"); doc.text(exp.company, marginX, y);
        y += 6;
        if (splitDesc.length > 0) {
          doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }

    if (finalProjects.length > 0 && drawHeader("Projects")) {
      for (const proj of finalProjects) {
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const splitDesc = proj.description ? doc.splitTextToSize(proj.description, contentWidth) : [];
        const blockHeight = 12 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break; // STRICT LIMIT

        doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.text(proj.name, marginX, y);
        if (proj.techStack) { doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "italic"); doc.text(`[${proj.techStack}]`, pageWidth - marginX, y, { align: "right" }); }
        y += 6;
        if (splitDesc.length > 0) {
          doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }
    
    if (education.length > 0 && drawHeader("Education")) {
      for (const edu of education) {
        if (!checkPageBreak(15)) break; // STRICT LIMIT
        doc.setFontSize(10); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.text(edu.degree, marginX, y);
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.text(edu.institution, marginX, y);
        y += 8;
      }
    }
  };

  // ==========================================
  // TEMPLATE 3: CREATIVE ACCENT
  // ==========================================
  const renderCreativeBold = () => {
    const marginX = 20; const contentWidth = pageWidth - 40; let y = 0;

    const drawAccentLine = () => { doc.setFillColor(147, 51, 234); doc.rect(0, 0, 8, pageHeight, "F"); };
    drawAccentLine();

    y = 25; doc.setTextColor(147, 51, 234); doc.setFont("helvetica", "bold"); doc.setFontSize(28);
    doc.text(personalInfo.fullName.toUpperCase(), marginX, y);
    
    y += 8; doc.setFontSize(12); doc.setTextColor(55, 65, 81); doc.setFont("helvetica", "normal");
    doc.text(role || personalInfo.headline, marginX, y);

    y += 8; doc.setFontSize(9); doc.setTextColor(107, 114, 128);
    const contactItems = [personalInfo.email, personalInfo.phone, cleanUrl(links.linkedin), cleanUrl(links.github), cleanUrl(links.portfolio)].filter(Boolean);
    doc.text(contactItems.join("  |  "), marginX, y); y += 12;

    const checkPageBreak = (needed) => { 
      return (y + needed <= pageHeight - 20); // STRICT 1-PAGE LIMIT
    };

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(14); doc.setTextColor(147, 51, 234); doc.setFont("helvetica", "bold"); doc.text(title, marginX, y);
      doc.setDrawColor(229, 231, 235); doc.setLineWidth(1); doc.line(marginX, y + 3, pageWidth - marginX, y + 3);
      y += 12;
      return true;
    };

    if (drawHeader("Profile")) {
      doc.setFontSize(10); doc.setTextColor(55, 65, 81); doc.setFont("helvetica", "normal");
      const splitSummary = doc.splitTextToSize(aiSummary, contentWidth);
      doc.text(splitSummary, marginX, y); y += (splitSummary.length * 5) + 8;
    }

    if (sortedSkills.length > 0 && drawHeader("Skills")) {
      let skillX = marginX; let skillY = y;
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      for (const skill of sortedSkills) {
        const textWidth = doc.getTextWidth(skill);
        if (skillX + textWidth + 6 > pageWidth - 20) { 
          skillX = marginX; skillY += 8; 
          if (!checkPageBreak(8)) break;
        }
        doc.setDrawColor(147, 51, 234); doc.setLineWidth(0.3);
        doc.roundedRect(skillX, skillY - 4, textWidth + 6, 6, 1.5, 1.5, "S");
        doc.setTextColor(147, 51, 234); doc.text(skill, skillX + 3, skillY);
        skillX += textWidth + 8;
      }
      y = skillY + 12;
    }

    if (finalExperience.length > 0 && drawHeader("Experience")) {
      for (const exp of finalExperience) {
        doc.setFontSize(10);
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(12); doc.setTextColor(31, 41, 55); doc.setFont("helvetica", "bold"); doc.text(exp.role, marginX, y);
        doc.setFontSize(9); doc.setTextColor(147, 51, 234); doc.setFont("helvetica", "normal"); doc.text(`${exp.startDate} - ${exp.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(107, 114, 128); doc.setFont("helvetica", "bold"); doc.text(exp.company, marginX, y);
        y += 6;
        if (splitDesc.length > 0) {
          doc.setFontSize(10); doc.setTextColor(75, 85, 99); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }

    if (finalProjects.length > 0 && drawHeader("Projects")) {
      for (const proj of finalProjects) {
        doc.setFontSize(10);
        const splitDesc = proj.description ? doc.splitTextToSize(proj.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(12); doc.setTextColor(31, 41, 55); doc.setFont("helvetica", "bold"); doc.text(proj.name, marginX, y);
        if (proj.techStack) { doc.setFontSize(9); doc.setTextColor(147, 51, 234); doc.setFont("helvetica", "italic"); doc.text(proj.techStack, marginX, y + 5); }
        y += (proj.techStack ? 10 : 6);
        if (splitDesc.length > 0) {
          doc.setFontSize(10); doc.setTextColor(75, 85, 99); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`• ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }
  };

  // ==========================================
  // TEMPLATE 4: CLASSIC ACADEMIC (Serif)
  // ==========================================
  const renderClassicAcademic = () => {
    let y = 20; const marginX = 20; const contentWidth = pageWidth - 40;
    let pageCount = 1;

    const checkPageBreak = (needed) => { 
      if (y + needed > pageHeight - 20) { 
        if (!isTwoPage || pageCount >= 2) return false; // Strict 2-page limit
        doc.addPage(); 
        pageCount++;
        y = 20; 
        
        // Page 2 Header
        doc.setFont("times", "bold"); doc.setFontSize(12); doc.setTextColor(0, 0, 0);
        doc.text(`${personalInfo.fullName.toUpperCase()} | Page 2`, marginX, y);
        doc.setFontSize(10); doc.setFont("times", "normal"); doc.setTextColor(50, 50, 50);
        const contactItems = [personalInfo.email, personalInfo.phone].filter(Boolean);
        doc.text(contactItems.join("  |  "), pageWidth - marginX, y, { align: "right" });
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(marginX, y + 3, pageWidth - marginX, y + 3);
        y += 15;
      }
      return true;
    };

    doc.setFont("times", "bold"); doc.setFontSize(26); doc.setTextColor(0, 0, 0);
    doc.text(personalInfo.fullName.toUpperCase(), pageWidth / 2, y, { align: "center" });
    
    y += 7; doc.setFontSize(12); doc.setFont("times", "normal"); doc.setTextColor(50, 50, 50);
    const contactItems = [personalInfo.email, personalInfo.phone, personalInfo.location, cleanUrl(links.linkedin)].filter(Boolean);
    doc.text(contactItems.join("  |  "), pageWidth / 2, y, { align: "center" });
    y += 12;

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.setFont("times", "bold");
      doc.text(title.toUpperCase(), marginX, y);
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8); doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
      y += 8;
      return true;
    };

    if (drawHeader("Professional Summary")) {
      doc.setFontSize(10); doc.setFont("times", "normal"); doc.setTextColor(30, 30, 30);
      const splitSummary = doc.splitTextToSize(aiSummary, contentWidth);
      doc.text(splitSummary, marginX, y); y += (splitSummary.length * 5) + 8;
    }

    if (finalExperience.length > 0 && drawHeader("Professional Experience")) {
      for (const exp of finalExperience) {
        doc.setFont("times", "normal"); doc.setFontSize(10);
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(11); doc.setFont("times", "bold"); doc.setTextColor(0, 0, 0);
        doc.text(exp.company, marginX, y);
        doc.setFontSize(10); doc.setFont("times", "normal");
        doc.text(`${exp.startDate} - ${exp.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setFont("times", "italic"); doc.text(exp.role, marginX, y);
        y += 6;
        if (splitDesc.length > 0) {
          doc.setFont("times", "normal");
          splitDesc.forEach((line, i) => doc.text(`•  ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }

    if (finalProjects.length > 0 && drawHeader("Projects & Research")) {
      for (const proj of finalProjects) {
        doc.setFont("times", "normal"); doc.setFontSize(10);
        const splitDesc = proj.description ? doc.splitTextToSize(proj.description, contentWidth) : [];
        const blockHeight = 10 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(11); doc.setFont("times", "bold"); doc.setTextColor(0, 0, 0);
        doc.text(proj.name, marginX, y);
        y += 5;
        if (splitDesc.length > 0) {
          doc.setFontSize(10); doc.setFont("times", "normal");
          splitDesc.forEach((line, i) => doc.text(`•  ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }

    if (education.length > 0 && drawHeader("Education")) {
      for (const edu of education) {
        if (!checkPageBreak(15)) break;
        doc.setFontSize(11); doc.setFont("times", "bold"); doc.text(edu.institution, marginX, y);
        doc.setFontSize(10); doc.setFont("times", "normal"); doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setFont("times", "italic"); doc.text(edu.degree, marginX, y);
        y += 8;
      }
    }

    if (sortedSkills.length > 0 && drawHeader("Technical Skills")) {
      doc.setFontSize(10); doc.setFont("times", "normal");
      const skillsText = doc.splitTextToSize(sortedSkills.join(", "), contentWidth);
      if (checkPageBreak(skillsText.length * 5)) {
        doc.text(skillsText, marginX, y);
      }
    }
  };

  // ==========================================
  // TEMPLATE 5: MIDNIGHT TECH
  // ==========================================
  const renderMidnightTech = () => {
    let y = 20; const marginX = 20; const contentWidth = pageWidth - 40;
    let pageCount = 1;

    const drawBg = () => { doc.setFillColor(17, 24, 39); doc.rect(0, 0, pageWidth, pageHeight, "F"); };
    drawBg();

    const checkPageBreak = (needed) => { 
      if (y + needed > pageHeight - 20) { 
        if (!isTwoPage || pageCount >= 2) return false; // Strict 2-page limit
        doc.addPage(); 
        pageCount++;
        drawBg(); 
        y = 20; 
        
        // Page 2 Header
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(249, 250, 251);
        doc.text(`${personalInfo.fullName.toUpperCase()} | PAGE 2`, marginX, y);
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(156, 163, 175);
        const contactItems = [personalInfo.email, personalInfo.phone].filter(Boolean);
        doc.text(contactItems.join("  //  "), pageWidth - marginX, y, { align: "right" });
        doc.setDrawColor(31, 41, 55); doc.setLineWidth(0.5); doc.line(marginX, y + 4, pageWidth - marginX, y + 4);
        y += 15;
      }
      return true;
    };

    doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(249, 250, 251);
    doc.text(personalInfo.fullName, marginX, y);
    y += 8; doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(16, 185, 129);
    doc.text(`> ${role || personalInfo.headline}`, marginX, y);
    y += 8; doc.setFontSize(9); doc.setTextColor(156, 163, 175);
    const contactItems = [personalInfo.email, personalInfo.phone, cleanUrl(links.linkedin), cleanUrl(links.github)].filter(Boolean);
    doc.text(contactItems.join("   //   "), marginX, y); y += 15;

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(12); doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "bold");
      doc.text(`_ ${title}`, marginX, y);
      doc.setDrawColor(31, 41, 55); doc.setLineWidth(0.5); doc.line(marginX, y + 3, pageWidth - marginX, y + 3);
      y += 10;
      return true;
    };

    if (drawHeader("SUMMARY")) {
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(209, 213, 219);
      const splitSummary = doc.splitTextToSize(aiSummary, contentWidth);
      doc.text(splitSummary, marginX, y); y += (splitSummary.length * 5) + 8;
    }

    if (sortedSkills.length > 0 && drawHeader("TECH_STACK")) {
      let skillX = marginX; let skillY = y;
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      for (const skill of sortedSkills) {
        const textWidth = doc.getTextWidth(skill);
        if (skillX + textWidth + 6 > pageWidth - 20) { 
          skillX = marginX; skillY += 8;
          if (!checkPageBreak(8)) break;
        }
        doc.setFillColor(6, 78, 59);
        doc.roundedRect(skillX, skillY - 4, textWidth + 6, 6, 1, 1, "F");
        doc.setTextColor(16, 185, 129); doc.text(skill, skillX + 3, skillY);
        skillX += textWidth + 8;
      }
      y = skillY + 12;
    }

    if (finalExperience.length > 0 && drawHeader("EXPERIENCE")) {
      for (const exp of finalExperience) {
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 250, 251); doc.text(exp.role, marginX, y);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(156, 163, 175); doc.text(`[${exp.startDate} - ${exp.endDate}]`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(16, 185, 129); doc.text(`@ ${exp.company}`, marginX, y);
        y += 6;
        if (splitDesc.length > 0) {
          doc.setTextColor(156, 163, 175);
          splitDesc.forEach((line, i) => doc.text(`> ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }

    if (finalProjects.length > 0 && drawHeader("PROJECTS")) {
      for (const proj of finalProjects) {
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const splitDesc = proj.description ? doc.splitTextToSize(proj.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(249, 250, 251); doc.text(proj.name, marginX, y);
        if (proj.techStack) { doc.setFontSize(9); doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "italic"); doc.text(proj.techStack, marginX, y + 5); }
        y += (proj.techStack ? 10 : 6);
        if (splitDesc.length > 0) {
          doc.setFontSize(10); doc.setTextColor(156, 163, 175); doc.setFont("helvetica", "normal");
          splitDesc.forEach((line, i) => doc.text(`> ${line}`, marginX + 2, y + (i * 5)));
          y += (splitDesc.length * 5) + 6;
        } else { y += 4; }
      }
    }
  };

  // ==========================================
  // TEMPLATE 6: SOFT PASTEL
  // ==========================================
  const renderSoftPastel = () => {
    let y = 0; const marginX = 20; const contentWidth = pageWidth - 40;

    doc.setFillColor(255, 228, 230);
    doc.rect(0, 0, pageWidth, 50, "F");

    y = 22;
    doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(63, 63, 70);
    doc.text(personalInfo.fullName, marginX, y);
    
    y += 8; doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(225, 29, 72);
    doc.text(role || personalInfo.headline, marginX, y);

    y += 8; doc.setFontSize(9); doc.setTextColor(113, 113, 122);
    const contactItems = [personalInfo.email, personalInfo.phone, cleanUrl(links.linkedin)].filter(Boolean);
    doc.text(contactItems.join("   •   "), marginX, y);
    
    y = 65;
    const checkPageBreak = (needed) => { return y + needed <= pageHeight - 20; };

    const drawHeader = (title) => {
      if (!checkPageBreak(15)) return false;
      doc.setFontSize(14); doc.setTextColor(63, 63, 70); doc.setFont("helvetica", "bold");
      doc.text(title, marginX, y);
      doc.setDrawColor(254, 205, 211); doc.setLineWidth(1.5);
      doc.line(marginX, y + 3, marginX + 30, y + 3);
      y += 12;
      return true;
    };

    if (drawHeader("About Me")) {
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(82, 82, 91);
      const splitSummary = doc.splitTextToSize(aiSummary, contentWidth);
      doc.text(splitSummary, marginX, y); y += (splitSummary.length * 5) + 10;
    }

    if (finalExperience.length > 0 && drawHeader("Work Experience")) {
      for (const exp of finalExperience) {
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const splitDesc = exp.description ? doc.splitTextToSize(exp.description, contentWidth) : [];
        const blockHeight = 15 + (splitDesc.length * 5);
        if (!checkPageBreak(blockHeight)) break;

        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(63, 63, 70); doc.text(exp.role, marginX, y);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(225, 29, 72); doc.text(`${exp.startDate} - ${exp.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(161, 161, 170); doc.setFont("helvetica", "italic"); doc.text(exp.company, marginX, y);
        y += 6;
        if (splitDesc.length > 0) {
          doc.setFont("helvetica", "normal"); doc.setTextColor(82, 82, 91);
          splitDesc.forEach((line, i) => doc.text(line, marginX, y + (i * 5)));
          y += (splitDesc.length * 5) + 8;
        } else { y += 4; }
      }
    }

    if (education.length > 0 && drawHeader("Education")) {
      for (const edu of education) {
        if (!checkPageBreak(15)) break;
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(63, 63, 70); doc.text(edu.degree, marginX, y);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(225, 29, 72); doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - marginX, y, { align: "right" });
        y += 5;
        doc.setFontSize(10); doc.setTextColor(113, 113, 122); doc.text(edu.institution, marginX, y);
        y += 10;
      }
    }
  };

  if (templateId === 1 || templateId === 7) renderModernBlue();
  else if (templateId === 2 || templateId === 8) renderExecutiveDark();
  else if (templateId === 3) renderCreativeBold();
  else if (templateId === 4 || templateId === 9) renderClassicAcademic();
  else if (templateId === 5 || templateId === 10) renderMidnightTech();
  else if (templateId === 6) renderSoftPastel();
  else renderModernBlue();

  doc.save(`${personalInfo.fullName.replace(/\s+/g, "_")}_${company.replace(/\s+/g, "")}_CV.pdf`);
};