import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Upload, Sparkles, Copy, CheckCircle, Image as ImageIcon, Loader2, AlertCircle, Settings } from 'lucide-react';
import { TextArea } from './TextArea';

interface StyleAnalyzerProps {
  apiKeys: string[];
  onOpenApiKeySettings: () => void;
}

export const StyleAnalyzer: React.FC<StyleAnalyzerProps> = ({ apiKeys, onOpenApiKeySettings }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzedStyle, setAnalyzedStyle] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasApiKeys = apiKeys.length > 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalyzedStyle(''); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    if (!hasApiKeys) {
      onOpenApiKeySettings();
      return;
    }

    setIsAnalyzing(true);

    try {
      // Use user keys strictly
      const ai = new GoogleGenAI({ apiKey: apiKeys[0] }); 
      
      // Split base64 to get data
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      // Optimized prompt for Style Extraction
      const prompt = `
        Act as an expert Art Director and AI Prompt Engineer.
        Your task is to analyze the uploaded image and extract a "Style Prompt" that can be used to replicate this exact aesthetic.

        STRICT RULES:
        1. IGNORE the specific subject matter (e.g., do not mention specific people, objects, or text).
        2. FOCUS ENTIRELY ON THE VISUAL STYLE:
           - Art Medium (e.g., watercolor, 3D render, vector art, photography, oil painting).
           - Visual Style (e.g., minimalist, cyberpunk, vintage, flat design, anime, realistic).
           - Lighting & Atmosphere (e.g., cinematic lighting, soft focus, dramatic shadows, volumetric fog).
           - Color Palette (e.g., pastel, neon, monochrome, high contrast, vibrant).
           - Composition (e.g., isometric, macro, rule of thirds).
           - Digital Rendering Keywords (e.g., 8k, unreal engine 5, octane render, detailed brush strokes).

        OUTPUT FORMAT:
        Return ONLY a comma-separated list of high-quality style modifiers. Do not write full sentences.
        Example output: "3D isometric render, low poly style, soft pastel color palette, volumetric lighting, high detailed, blender, 4k resolution"
      `;

      // Switching to gemini-2.5-flash for superior Multimodal (Vision) analysis capabilities
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: prompt }
          ]
        }
      });

      setAnalyzedStyle(response.text || "Không thể phân tích phong cách.");

    } catch (err: any) {
      console.error("Analysis Error", err);
      alert("Lỗi phân tích: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analyzedStyle);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Học Ý tưởng Phong cách (Style Analyzer)</h2>
        <p className="text-slate-400 mt-3 text-lg">Tải lên một bức ảnh mẫu, AI sẽ phân tích và trích xuất "công thức" phong cách nghệ thuật cho bạn.</p>
      </div>

      {!hasApiKeys && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center">
            <div className="bg-red-500/20 p-2 rounded-full mr-3 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-200">Chưa có API Key</h4>
              <p className="text-sm text-red-300/80">Vui lòng nhập API Key để sử dụng tính năng phân tích.</p>
            </div>
          </div>
          <button 
            onClick={onOpenApiKeySettings}
            className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-500 transition-colors shadow-lg"
          >
            <Settings size={16} className="mr-2" /> Cấu hình
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${!hasApiKeys ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Upload Column */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-4 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-96 relative group
              ${selectedImage 
                ? 'border-cyan-500/50 bg-cyan-900/10' 
                : 'border-slate-700 hover:border-cyan-400 hover:bg-slate-800/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'}
            `}
          >
            {selectedImage ? (
              <div className="relative w-full h-full">
                <img src={selectedImage} alt="Reference" className="w-full h-full object-contain rounded-xl" />
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                  <p className="text-white font-bold text-lg flex items-center"><Upload size={24} className="mr-3 text-cyan-400"/> Chọn ảnh khác</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-slate-800 text-cyan-400 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <ImageIcon size={48} />
                </div>
                <p className="text-slate-200 font-bold text-xl">Tải ảnh mẫu lên</p>
                <p className="text-slate-500 mt-2 font-medium">JPG, PNG (Max 4MB)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing || !hasApiKeys}
            className={`
              w-full flex items-center justify-center px-6 py-4 rounded-2xl font-extrabold text-lg text-white transition-all shadow-xl
              ${!selectedImage || isAnalyzing || !hasApiKeys 
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]'}
            `}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={24} className="mr-3 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles size={24} className="mr-3" />
                Phân tích Phong cách
              </>
            )}
          </button>
        </div>

        {/* Result Column */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col h-96 md:h-auto overflow-hidden ring-1 ring-white/5">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-b border-white/5 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                 <span className="font-bold text-slate-200 tracking-wide">KẾT QUẢ PHÂN TÍCH</span>
             </div>
             {analyzedStyle && (
               <button
                 onClick={handleCopy}
                 className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isCopied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
               >
                 {isCopied ? <CheckCircle size={14} className="mr-1.5"/> : <Copy size={14} className="mr-1.5"/>}
                 {isCopied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}
               </button>
             )}
          </div>
          <div className="flex-1 p-0 relative">
             <textarea
               readOnly
               value={analyzedStyle}
               placeholder="Kết quả mô tả phong cách sẽ hiện ở đây..."
               className="w-full h-full p-8 resize-none focus:outline-none text-slate-300 bg-transparent text-base leading-relaxed font-mono"
             />
             {isAnalyzing && (
               <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm z-10">
                 <div className="flex flex-col items-center">
                    <Loader2 className="text-amber-500 animate-spin mb-2" size={40} />
                    <span className="text-amber-500 font-bold">AI Vision Processing...</span>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};