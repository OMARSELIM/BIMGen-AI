import React, { useState } from 'react';
import { ProjectData, AnalysisStatus } from '../types';
import { PROJECT_TYPES, DISCIPLINES, SOFTWARE_OPTIONS, LOD_LEVELS, STANDARDS } from '../constants';
import { generateBEP } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Loader2, Download, Printer, Edit2, Check, ArrowRight } from 'lucide-react';

const Generator: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    projectType: PROJECT_TYPES[0],
    disciplines: [],
    software: [],
    lod: LOD_LEVELS[2],
    standards: STANDARDS[0],
    additionalNotes: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  const toggleSelection = (list: string[], item: string, field: keyof ProjectData) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    setFormData({ ...formData, [field]: newList });
  };

  const handleGenerate = async () => {
    setStatus(AnalysisStatus.LOADING);
    setStep(2);
    try {
      const generatedText = await generateBEP(formData);
      setResult(generatedText);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'> " +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    
    // Simple conversion of markdown-like structure to HTML for word
    // In a real app, we'd render the Markdown to HTML string properly
    const content = document.getElementById('bep-content')?.innerHTML || "";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${formData.projectName.replace(/\s+/g, '_')}_BEP.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
           <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Configuration</h2>
           <p className="text-slate-500">Enter your project details to generate a tailored execution plan.</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
              <input 
                type="text" 
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                placeholder="e.g., Skyline Tower Phase 1"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bim-500 focus:border-bim-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
              <select 
                value={formData.projectType}
                onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bim-500 focus:border-bim-500 outline-none bg-white"
              >
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Standards & LOD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">BIM Standard</label>
              <select 
                value={formData.standards}
                onChange={(e) => setFormData({...formData, standards: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bim-500 focus:border-bim-500 outline-none bg-white"
              >
                {STANDARDS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target LOD</label>
              <select 
                value={formData.lod}
                onChange={(e) => setFormData({...formData, lod: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bim-500 focus:border-bim-500 outline-none bg-white"
              >
                {LOD_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Multi-selects */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Disciplines</label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(d => (
                <button
                  key={d}
                  onClick={() => toggleSelection(formData.disciplines, d, 'disciplines')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    formData.disciplines.includes(d)
                      ? 'bg-bim-50 text-bim-600 border-bim-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {d}
                  {formData.disciplines.includes(d) && <Check className="inline-block ml-1 w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Software Ecosystem</label>
            <div className="flex flex-wrap gap-2">
              {SOFTWARE_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSelection(formData.software, s, 'software')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    formData.software.includes(s)
                      ? 'bg-bim-50 text-bim-600 border-bim-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s}
                  {formData.software.includes(s) && <Check className="inline-block ml-1 w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes / Specific Requirements</label>
              <textarea 
                value={formData.additionalNotes}
                onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                placeholder="E.g., Client requires CDE to be hosted on local servers..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bim-500 focus:border-bim-500 outline-none transition-all h-24 resize-none"
              />
            </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={!formData.projectName || formData.disciplines.length === 0}
            className="flex items-center gap-2 bg-bim-600 hover:bg-bim-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-bim-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate BEP
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Result View
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
       <div className="flex items-center justify-between mb-6 no-print">
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
            ← Back to Configuration
          </button>
          
          {status === AnalysisStatus.SUCCESS && (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${isEditing ? 'bg-bim-100 border-bim-200 text-bim-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done Editing' : 'Edit Text'}
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print PDF
              </button>
              <button 
                onClick={handleDownloadDoc}
                className="flex items-center gap-2 px-4 py-2 bg-bim-600 text-white rounded-lg font-medium hover:bg-bim-700 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                Download .doc
              </button>
            </div>
          )}
       </div>

       {status === AnalysisStatus.LOADING && (
         <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Loader2 className="w-16 h-16 text-bim-500 animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-slate-800">Generating Execution Plan...</h3>
            <p className="text-slate-500 mt-2">Analyzing project requirements and drafting ISO-compliant sections.</p>
         </div>
       )}

       {status === AnalysisStatus.ERROR && (
         <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl">!</div>
            <h3 className="text-xl font-semibold text-slate-800">Generation Failed</h3>
            <p className="text-slate-500 mt-2 text-center max-w-md">Something went wrong while communicating with the AI. Please try again.</p>
            <button onClick={() => handleGenerate()} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Retry</button>
         </div>
       )}

       {status === AnalysisStatus.SUCCESS && (
         <div className="flex-1 bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto p-8 lg:p-12 print-content">
              {isEditing ? (
                <textarea 
                  className="w-full h-full p-4 border border-slate-300 rounded-md font-mono text-sm leading-relaxed focus:ring-2 focus:ring-bim-500 outline-none"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                />
              ) : (
                <div id="bep-content" className="markdown-body max-w-4xl mx-auto">
                   <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
         </div>
       )}
    </div>
  );
};

export default Generator;
