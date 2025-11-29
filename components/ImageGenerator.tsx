import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Download, RefreshCw, XCircle, Loader2, AlertCircle, Settings } from 'lucide-react';
import { TextArea } from './TextArea';
import { GeneratedImage } from '../types';

interface ImageGeneratorProps {
  initialPrompt: string;
  apiKeys: string[];
  onOpenApiKeySettings: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  initialPrompt, 
  apiKeys,
  onOpenApiKeySettings
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [numImages, setNumImages] = useState<1 | 2>(1);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasApiKeys = apiKeys.length > 0;

  // Update local state if initialPrompt prop changes (e.g. copied from another tab)
  React.useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Vui lòng nhập Prompt.");
      return;
    }

    if (!hasApiKeys) {
      onOpenApiKeySettings();
      return;
    }

    const keysToUse = apiKeys;

    setIsGenerating(true);
    setGeneratedImages([]);
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const newImages: GeneratedImage[] = [];
      const loops = numImages === 1 ? 1 : 2;

      for (let i = 0; i < loops; i++) {
        if (controller.signal.aborted) break;

        // Round robin key selection
        const key = keysToUse[i % keysToUse.length];
        const ai = new GoogleGenAI({ apiKey: key });

        // Using gemini-3-pro-image-preview as requested
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: {
            parts: [{ text: prompt }]
          }
        });

        // The image usually comes in candidates[0].content.parts
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              newImages.push({
                id: Date.now().toString() + i,
                url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                prompt: prompt
              });
            }
          }
        }
      }

      if (!controller.signal.aborted) {
        setGeneratedImages(newImages);
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        console.error("Image Gen Error", err);
        alert("Lỗi tạo ảnh: " + (err.message || "Vui lòng kiểm tra API Key và thử lại."));
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `edu-visual-gen-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Tạo Hình Ảnh Minh Họa</h2>
        <p className="text-slate-400 mt-2 text-lg">Sử dụng prompt của bạn để tạo ra hình ảnh chất lượng cao (Model: Gemini 3 Pro Image).</p>
      </div>

      {!hasApiKeys && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-red-500/20 p-2 rounded-full mr-3 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-200">Chưa có API Key</h4>
              <p className="text-sm text-red-300/80">Vui lòng nhập API Key để tạo hình ảnh.</p>
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

      {/* Input Section */}
      <div className={`bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 ${!hasApiKeys ? 'opacity-50 pointer-events-none' : ''}`}>
        <TextArea
          label="Prompt (Dán nội dung prompt vào đây)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A detailed educational infographic about..."
          rows={6}
          className="font-mono text-sm"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center space-x-4 bg-slate-800/50 p-2 rounded-xl border border-white/5">
            <span className="text-sm font-bold text-slate-300 ml-2">Số lượng ảnh:</span>
            <div className="flex bg-slate-900 rounded-lg p-1">
              <button
                onClick={() => setNumImages(1)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${numImages === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                1 Ảnh
              </button>
              <button
                onClick={() => setNumImages(2)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${numImages === 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                2 Ảnh
              </button>
            </div>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            {isGenerating ? (
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-bold transition-colors"
              >
                <XCircle size={20} className="mr-2" />
                Hủy
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!hasApiKeys}
                className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon size={20} className="mr-2" />
                Tạo Hình Ảnh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="relative">
             <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-20 h-20 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin relative z-10"></div>
          </div>
          <p className="mt-6 text-pink-400 font-bold text-lg animate-pulse">Đang vẽ tranh... Vui lòng đợi...</p>
        </div>
      )}

      {/* Results */}
      {!isGenerating && generatedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {generatedImages.map((img, idx) => (
            <div key={img.id} className="bg-slate-900/80 p-4 rounded-3xl shadow-2xl border border-white/10 group hover:border-cyan-500/30 transition-all">
              <div className="aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden relative mb-4">
                 <img src={img.url} alt="Generated" className="w-full h-full object-contain" />
                 <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      onClick={() => downloadImage(img.url, idx)}
                      className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transform transition-all"
                    >
                      <Download size={20} className="mr-2" /> Tải xuống
                    </button>
                 </div>
              </div>
              <div className="flex justify-center">
                <button
                   onClick={handleGenerate}
                   className="text-sm font-bold text-slate-400 hover:text-cyan-400 flex items-center transition-colors uppercase tracking-wide"
                >
                  <RefreshCw size={16} className="mr-2" /> Tạo lại ảnh này
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};