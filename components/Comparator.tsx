import React, { useState } from 'react';
import { AnalysisStatus, ComparisonResult } from '../types';
import { compareBEP } from '../services/geminiService';
import { STANDARDS } from '../constants';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle, Upload, CheckCircle2, XCircle } from 'lucide-react';

const Comparator: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [selectedStandard, setSelectedStandard] = useState(STANDARDS[0]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText) return;
    setStatus(AnalysisStatus.LOADING);
    try {
      const analysisResult = await compareBEP(inputText, selectedStandard);
      setResult(analysisResult);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-bim-600" />
            Input Existing BEP
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Compare against</label>
            <select 
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your BEP text here, or upload a .txt/.md file..."
              className="w-full h-full p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-bim-500 outline-none text-sm font-mono leading-relaxed"
            />
             <div className="absolute bottom-4 right-4 flex gap-2">
                <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-sm shadow-sm transition-all flex items-center gap-2">
                   <Upload className="w-3 h-3" /> Upload Text File
                   <input type="file" accept=".txt,.md,.json" className="hidden" onChange={handleFileUpload} />
                </label>
             </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!inputText || status === AnalysisStatus.LOADING}
            className="mt-4 w-full bg-bim-600 text-white py-3 rounded-lg font-semibold hover:bg-bim-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-bim-500/20"
          >
            {status === AnalysisStatus.LOADING ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </span>
            ) : "Run Compliance Analysis"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col h-full overflow-hidden">
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full overflow-auto ${status === AnalysisStatus.IDLE ? 'flex items-center justify-center text-slate-400' : ''}`}>
           {status === AnalysisStatus.IDLE && (
             <div className="text-center">
               <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
               <p>Enter BEP text and run analysis to see results.</p>
             </div>
           )}

           {status === AnalysisStatus.LOADING && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                 <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-bim-500 rounded-full border-t-transparent animate-spin"></div>
                 </div>
                 <p className="text-slate-600 font-medium">Comparing against {selectedStandard}...</p>
                 <p className="text-xs text-slate-400">This may take up to 30 seconds.</p>
              </div>
           )}

           {status === AnalysisStatus.ERROR && (
             <div className="text-center text-red-500">
               <p>Analysis failed. Please check inputs and try again.</p>
             </div>
           )}

           {status === AnalysisStatus.SUCCESS && result && (
             <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                   <h3 className="text-xl font-bold text-slate-800">Analysis Report</h3>
                   <div className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${result.score >= 80 ? 'bg-green-100 text-green-700' : result.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {result.score >= 80 ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                      Score: {result.score}/100
                   </div>
                </div>
                
                <div className="markdown-body text-sm">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Comparator;
