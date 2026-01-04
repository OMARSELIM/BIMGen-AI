import { GoogleGenAI } from "@google/genai";
import { ProjectData, ComparisonResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBEP = async (data: ProjectData): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `
    Act as a Senior BIM Manager. Create a comprehensive, professional BIM Execution Plan (BEP) for the following project.
    
    Project Details:
    - Name: ${data.projectName}
    - Type: ${data.projectType}
    - Disciplines involved: ${data.disciplines.join(", ")}
    - Software Platforms: ${data.software.join(", ")}
    - Target LOD: ${data.lod}
    - Standards: ${data.standards}
    - Additional Notes: ${data.additionalNotes}

    The BEP must be structured professionally using Markdown formatting. Include the following sections:
    1. Project Information & Goals
    2. Roles & Responsibilities (RACI Matrix suggestion)
    3. Process Definition (Collaboration procedures, CDE strategy)
    4. Information Exchange (Formats, Frequency)
    5. BIM Model Standards (Coordinates, Naming Conventions, Colors)
    6. Quality Control & Clash Detection Strategy
    7. Technology Infrastructure (Hardware/Software versions)
    
    Make the content realistic, technical, and ready for use. Use tables where appropriate.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert BIM Consultant specializing in ISO 19650 compliant execution plans.",
      }
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Error generating BEP:", error);
    throw error;
  }
};

export const compareBEP = async (currentBepText: string, standard: string): Promise<ComparisonResult> => {
  const ai = getAIClient();

  const prompt = `
    Analyze the following BIM Execution Plan (BEP) text against strict ${standard} requirements.
    
    Input BEP Text:
    """
    ${currentBepText.substring(0, 20000)} 
    """
    
    (Note: Input text truncated to fit context if necessary)

    Provide a detailed comparison report in Markdown format.
    1. Executive Summary: A quick pass/fail assessment.
    2. Compliance Checklist: What is present vs. missing based on ${standard}.
    3. Gap Analysis: Specific sections that are weak or missing.
    4. Recommendations: Actionable text to improve the document.
    5. Compliance Score: Give a score out of 100 based on completeness and quality.

    Format the output as a structured JSON object inside a code block, but provide the analysis text in a field called 'analysis' and the score in a field called 'score'. 
    
    Example response structure:
    \`\`\`json
    {
      "analysis": "# Executive Summary\n...",
      "score": 85
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better reasoning on comparison
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    
    return {
      analysis: result.analysis || "Analysis failed.",
      score: result.score || 0
    };

  } catch (error) {
    console.error("Error comparing BEP:", error);
    throw error;
  }
};
