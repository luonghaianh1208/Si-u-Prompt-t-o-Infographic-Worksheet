import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, CheckCircle, AlertCircle, FileText, Palette, Layers, Settings, Menu, Save as SaveIcon, LayoutDashboard, User as UserIcon, Bot, PenTool, Loader2, AlertTriangle, Languages, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { FormData, FormErrors, UserProfile, SavedPrompt, MainTab } from './types';
import { TARGET_AUDIENCES, VISUAL_STYLES, FEATURE_OPTIONS, OTHER_STYLE_KEY, OTHER_AUDIENCE_KEY, MATERIAL_TYPES, DEFAULT_PROFILE, COMMON_SUBJECTS, DIMENSIONS, CONTENT_LANGUAGES, IMAGE_QUALITIES, EDUCATION_FIELDS } from './constants';
import { Input } from './components/Input';
import { TextArea } from './components/TextArea';
import { Select } from './components/Select';
import { Checkbox } from './components/Checkbox';
import { Navigation } from './components/Navigation';
import { HistorySidebar } from './components/HistorySidebar';
import { ProfileSettings } from './components/ProfileSettings';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ImageGenerator } from './components/ImageGenerator';
import { StyleAnalyzer } from './components/StyleAnalyzer';
import { ProUpgradeModal } from './components/ProUpgradeModal';

const App: React.FC = () => {
  // --- STATE ---
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('create_prompt');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Right sidebar
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProUpgradeModalOpen, setIsProUpgradeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // PRO State
  const [isPro, setIsPro] = useState(false);
  
  // API State
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); // 0-100
  const generationAbortControllerRef = useRef<AbortController | null>(null);

  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    educationField: 'Giáo dục Phổ thông (K-12)',
    subject: '',
    materialType: '',
    targetAudience: '',
    customTargetAudience: '',
    contentLanguage: 'Tiếng Việt (Vietnamese)',
    keyContent: '',
    autoContent: false,
    features: [],
    visualStyle: '',
    customStyle: '',
    dimension: '',
    imageQuality: 'Full HD (1920 x 1080 px) - Tiêu chuẩn (Standard)',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Refs
  const resultRef = useRef<HTMLDivElement>(null);

  // Helper to check profile completeness
  const isProfileIncomplete = !userProfile.fullName || !userProfile.mainSubject || !userProfile.gradeLevel;
  // Helper to check API Key presence
  const hasApiKeys = apiKeys.length > 0;

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
    // Load PRO status
    const storedPro = localStorage.getItem('eduVisual_isPro');
    if (storedPro === 'true') {
      setIsPro(true);
    }

    // Load Profile
    const storedProfile = localStorage.getItem('eduVisual_profile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        setFormData(prev => ({
          ...prev,
          targetAudience: prev.targetAudience || parsedProfile.gradeLevel || '',
          subject: prev.subject || parsedProfile.mainSubject || ''
        }));
      } catch (e) { console.error('Error loading profile', e); }
    }

    // Load Prompts
    const storedPrompts = localStorage.getItem('eduVisual_prompts');
    if (storedPrompts) {
      try {
        setSavedPrompts(JSON.parse(storedPrompts));
      } catch (e) { console.error('Error loading prompts', e); }
    }

    // Load API Keys
    const storedKeys = localStorage.getItem('eduVisual_apiKeys');
    if (storedKeys) {
      try {
        const parsedKeys = JSON.parse(storedKeys);
        if (Array.isArray(parsedKeys)) {
          setApiKeys(parsedKeys);
        }
      } catch (e) { console.error('Error loading API keys', e); }
    }
    
    // Check screen size to auto-open sidebar on large screens
    if (window.innerWidth >= 1024) {
      setIsHistoryOpen(true);
    }
  }, []);

  // --- EFFECT: ENFORCE PRO PERMISSIONS ---
  useEffect(() => {
    if (!isPro && (activeTab === 'create_image' || activeTab === 'learn_ideas')) {
      setActiveTab('create_prompt');
    }
  }, [isPro, activeTab]);

  // --- EFFECT: SIMULATE PROGRESS ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      setGenerationProgress(0);
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10 + 5;
        });
      }, 500);
    } else {
      setGenerationProgress(100);
      const timer = setTimeout(() => setGenerationProgress(0), 500);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // --- HANDLERS: PROFILE & KEYS ---
  const saveProfile = () => {
    try {
        localStorage.setItem('eduVisual_profile', JSON.stringify(userProfile));
        setFormData(prev => ({
          ...prev,
          targetAudience: userProfile.gradeLevel,
          subject: userProfile.mainSubject
        }));
        alert('Đã lưu hồ sơ thành công!');
        setActiveTab('create_prompt');
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            alert('Không thể lưu hồ sơ do ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.');
        } else {
            alert('Đã xảy ra lỗi khi lưu hồ sơ.');
        }
    }
  };

  const handleSaveApiKeys = (keys: string[]) => {
    setApiKeys(keys);
    localStorage.setItem('eduVisual_apiKeys', JSON.stringify(keys));
    alert('Đã lưu cấu hình API Key thành công!');
  };

  const handleProActivationSuccess = () => {
    setIsPro(true);
    localStorage.setItem('eduVisual_isPro', 'true');
    setIsProUpgradeModalOpen(false);
  };

  // --- HANDLERS: SIDEBAR & PROMPTS ---
  const handleNewPrompt = () => {
    setCurrentPromptId(null);
    setFormData({
      topic: '',
      educationField: 'Giáo dục Phổ thông (K-12)',
      subject: userProfile.mainSubject || '',
      materialType: '',
      targetAudience: userProfile.gradeLevel || '',
      customTargetAudience: '',
      contentLanguage: 'Tiếng Việt (Vietnamese)',
      keyContent: '',
      autoContent: false,
      features: [],
      visualStyle: '',
      customStyle: '',
      dimension: '',
      imageQuality: 'Full HD (1920 x 1080 px) - Tiêu chuẩn (Standard)',
    });
    setGeneratedPrompt(null);
    setActiveTab('create_prompt');
  };

  const handleSelectPrompt = (prompt: SavedPrompt) => {
    setCurrentPromptId(prompt.id);
    setFormData(prompt.data);
    setGeneratedPrompt(null);
    setActiveTab('create_prompt');
    if (window.innerWidth < 1024) setIsHistoryOpen(false);
  };

  const saveCurrentPrompt = () => {
    if (!formData.topic) {
      alert("Vui lòng nhập Chủ đề trước khi lưu.");
      return;
    }

    const now = Date.now();
    let updatedPrompts: SavedPrompt[];
    let newId = currentPromptId;

    if (currentPromptId) {
      updatedPrompts = savedPrompts.map(p => 
        p.id === currentPromptId 
          ? { ...p, title: formData.topic, updatedAt: now, data: formData }
          : p
      );
    } else {
      newId = Date.now().toString();
      const newPrompt: SavedPrompt = {
        id: newId,
        title: formData.topic,
        createdAt: now,
        updatedAt: now,
        data: formData
      };
      updatedPrompts = [newPrompt, ...savedPrompts];
    }

    setSavedPrompts(updatedPrompts);
    setCurrentPromptId(newId);
    localStorage.setItem('eduVisual_prompts', JSON.stringify(updatedPrompts));
    alert("Đã lưu prompt thành công!");
  };

  const handleDeletePrompt = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa prompt này?")) {
      const updated = savedPrompts.filter(p => p.id !== id);
      setSavedPrompts(updated);
      localStorage.setItem('eduVisual_prompts', JSON.stringify(updated));
      if (currentPromptId === id) handleNewPrompt();
    }
  };

  // --- HANDLERS: FORM & GENERATION ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'educationField') {
      const isK12 = value === 'Giáo dục Phổ thông (K-12)';
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subject: isK12 ? prev.subject : ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCheckboxChange = (id: string) => {
    setFormData((prev) => {
      const isSelected = prev.features.includes(id);
      return {
        ...prev,
        features: isSelected ? prev.features.filter((f) => f !== id) : [...prev.features, id]
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    if (!formData.educationField) { newErrors.educationField = 'Vui lòng chọn lĩnh vực giáo dục'; isValid = false; }
    if (!formData.materialType) { newErrors.materialType = 'Vui lòng chọn loại tài liệu'; isValid = false; }
    if (!formData.topic.trim()) { newErrors.topic = 'Vui lòng nhập chủ đề bài học'; isValid = false; }
    if (!formData.targetAudience) { newErrors.targetAudience = 'Vui lòng chọn đối tượng học sinh'; isValid = false; }
    if (formData.targetAudience === OTHER_AUDIENCE_KEY && !formData.customTargetAudience.trim()) { newErrors.customTargetAudience = 'Vui lòng nhập đối tượng học sinh cụ thể'; isValid = false; }
    if (!formData.dimension) { newErrors.dimension = 'Vui lòng chọn kích thước đầu ra'; isValid = false; }
    if (!formData.imageQuality) { newErrors.imageQuality = 'Vui lòng chọn chất lượng ảnh'; isValid = false; }
    if (!formData.autoContent && !formData.keyContent.trim()) { newErrors.keyContent = 'Vui lòng nhập nội dung hoặc chọn AI Đề xuất'; isValid = false; }
    if (formData.visualStyle === OTHER_STYLE_KEY && !formData.customStyle.trim()) { newErrors.customStyle = 'Vui lòng nhập mô tả phong cách'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleCancelGeneration = () => {
    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
      generationAbortControllerRef.current = null;
    }
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const executeWithKeyRotation = async (systemInstruction: string, userPrompt: string, keys: string[], startIndex = 0): Promise<string> => {
    if (startIndex >= keys.length) {
       throw new Error("Tất cả các API Key đều bị giới hạn hoặc không hợp lệ.");
    }
    const currentKey = keys[startIndex];
    try {
      const ai = new GoogleGenAI({ apiKey: currentKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userPrompt,
        config: { systemInstruction, temperature: 0.7 }
      });
      return response.text || '';
    } catch (error: any) {
      if (error.message?.includes('429') || error.status === 429) {
        return executeWithKeyRotation(systemInstruction, userPrompt, keys, startIndex + 1);
      }
      throw error;
    }
  };

  const generatePromptWithAI = async () => {
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    
    // Strict enforcement
    if (apiKeys.length === 0) {
        alert("Vui lòng cấu hình API Key để sử dụng AI.");
        setIsApiKeyModalOpen(true);
        return;
    }

    if (generationAbortControllerRef.current) generationAbortControllerRef.current.abort();
    const controller = new AbortController();
    generationAbortControllerRef.current = controller;
    setIsGenerating(true);

    try {
      const featureLabels = formData.features.map(id => FEATURE_OPTIONS.find(f => f.id === id)?.label).filter(Boolean);
      const styleToUse = formData.visualStyle === OTHER_STYLE_KEY ? formData.customStyle : formData.visualStyle;
      const audienceToUse = formData.targetAudience === OTHER_AUDIENCE_KEY ? formData.customTargetAudience : formData.targetAudience;

      const systemInstruction = `You are an expert prompt engineer specializing in Google Gemini and Imagen 3 image generation models.
      YOUR TASK: Write a single, highly detailed, optimized English prompt to generate an educational image resource.
      CRITICAL OUTPUT RULES:
      1. OUTPUT ONLY THE RAW PROMPT. No introductions.
      2. The prompt MUST be in ENGLISH.
      3. Focus heavily on VISUAL DETAILS: Art style, lighting, composition, color palette.
      4. Do NOT mention Midjourney or DALL-E.
      5. Include specific instructions for the layout.
      6. QUALITY SETTING: ${formData.imageQuality}.
      7. LANGUAGE HANDLING: Text visible in the design MUST be in ${formData.contentLanguage}.`;

      const userPrompt = `
      Input Data:
      - Type: ${formData.materialType}
      - Field: ${formData.educationField}
      - Topic: ${formData.topic}
      ${formData.subject ? `- Subject: ${formData.subject}` : ''}
      - Audience: ${audienceToUse}
      - Dimensions: ${formData.dimension}
      - Style: ${styleToUse}
      - Language: ${formData.contentLanguage}
      - Features: ${featureLabels.join(', ') || 'None'}
      - Content Mode: ${formData.autoContent ? 'AI suggests content' : 'User content'}
      ${!formData.autoContent ? `- User Content: "${formData.keyContent}"` : ''}
      ${formData.autoContent ? `- CONTENT STANDARDS: The educational knowledge, terminology, and concepts generated MUST strictly adhere to the 'Vietnam 2018 General Education Program' (Chương trình GDPT 2018) standards appropriate for the ${audienceToUse} level.` : ''}
      - Teacher Context: ${userProfile.fullName}, ${userProfile.mainSubject}.
      Write optimized prompt in English.`;

      const resultText = await executeWithKeyRotation(systemInstruction, userPrompt, apiKeys);
      if (controller.signal.aborted) return;
      setGeneratedPrompt(resultText.trim());
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    } catch (err: any) {
      if (!controller.signal.aborted) alert("Lỗi gọi AI: " + (err.message));
    } finally {
       if (!controller.signal.aborted) { setIsGenerating(false); setGenerationProgress(100); }
    }
  };

  const copyToClipboard = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyAndSwitchToImageGen = () => {
    if (generatedPrompt) {
        navigator.clipboard.writeText(generatedPrompt);
        if (isPro) {
            setActiveTab('create_image');
        } else {
            setIsProUpgradeModalOpen(true);
        }
    }
  };

  // --- RENDER HELPERS ---
  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <ProfileSettings 
          profile={userProfile}
          onChange={setUserProfile}
          onSave={saveProfile}
          errors={errors}
        />
      );
    }

    if (activeTab === 'create_image') {
      if (!isPro) return null; // Should be handled by useEffect but safe return
      return (
        <ImageGenerator 
          initialPrompt={generatedPrompt || ''}
          apiKeys={apiKeys}
          onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
        />
      );
    }

    if (activeTab === 'learn_ideas') {
      if (!isPro) return null;
      return (
        <StyleAnalyzer 
          apiKeys={apiKeys}
          onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
        />
      );
    }

    // Default: 'create_prompt'
    return (
      <div className="max-w-5xl mx-auto pb-20 relative z-10">
         {/* WARNING BANNER FOR API KEY */}
         {!hasApiKeys && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/50 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center">
                <div className="bg-red-500/20 p-2 rounded-full mr-3 text-red-400">
                   <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-100">Chưa có API Key</h4>
                  <p className="text-sm text-red-200/80">
                    Vui lòng nhập Google Gemini API Key để sử dụng tính năng.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-nowrap ml-4"
              >
                Nhập Key Ngay
              </button>
            </div>
         )}

         {/* WARNING BANNER FOR PROFILE */}
         {isProfileIncomplete && (
           <div className="bg-amber-900/30 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 mb-6 flex items-start shadow-lg">
             <AlertTriangle className="text-amber-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
             <div className="flex-1">
               <h4 className="text-sm font-bold text-amber-100 mb-1">Hồ sơ chưa hoàn thiện</h4>
               <p className="text-sm text-amber-200/80">
                 Hãy <button onClick={() => setActiveTab('profile')} className="font-bold underline ml-1 text-amber-300 hover:text-amber-200">cài đặt hồ sơ cá nhân</button> để AI tối ưu kết quả tốt hơn.
               </p>
             </div>
           </div>
         )}

         {/* FORM BLOCK */}
         <div className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden ${!hasApiKeys ? 'opacity-80' : ''}`}>
           {/* Decorative top bar */}
           <div className="h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
           
           <div className="p-6 sm:p-10 space-y-12">
              
              {/* Section 1 */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
                    <FileText className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">1. Thông tin cốt lõi</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Lĩnh vực giáo dục" name="educationField" value={formData.educationField} onChange={handleInputChange} options={EDUCATION_FIELDS} required error={errors.educationField} />
                  <Select label="Loại tài liệu" name="materialType" value={formData.materialType} onChange={handleInputChange} options={MATERIAL_TYPES} required error={errors.materialType} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Kích thước" name="dimension" value={formData.dimension} onChange={handleInputChange} options={DIMENSIONS} required error={errors.dimension} />
                  <Select label="Chất lượng ảnh" name="imageQuality" value={formData.imageQuality} onChange={handleInputChange} options={IMAGE_QUALITIES} required error={errors.imageQuality} />
                </div>
                <div>
                  <Input label="Chủ đề bài học" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="Ví dụ: Vòng đời của bướm..." required error={errors.topic} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.educationField === 'Giáo dục Phổ thông (K-12)' && (
                    <Select label="Môn học" name="subject" value={formData.subject} onChange={handleInputChange} options={COMMON_SUBJECTS} error={errors.subject} />
                  )}
                  <div>
                    <Select label="Đối tượng" name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} options={TARGET_AUDIENCES} required error={errors.targetAudience} />
                    {formData.targetAudience === OTHER_AUDIENCE_KEY && (
                      <div className="mt-2"><Input label="Cụ thể" name="customTargetAudience" value={formData.customTargetAudience} onChange={handleInputChange} error={errors.customTargetAudience} /></div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
                   <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-slate-300">Nội dung chi tiết</label>
                      <Select label="" className="w-48 !mb-0" name="contentLanguage" value={formData.contentLanguage} onChange={handleInputChange} options={CONTENT_LANGUAGES} />
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <label className={`flex-1 flex items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${!formData.autoContent ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}`}>
                        <input type="radio" name="contentMode" checked={!formData.autoContent} onChange={() => setFormData(p => ({ ...p, autoContent: false }))} className="hidden" />
                        <span className={`font-semibold ${!formData.autoContent ? 'text-cyan-400' : 'text-slate-400'}`}>Tự nhập nội dung</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.autoContent ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}`}>
                        <input type="radio" name="contentMode" checked={formData.autoContent} onChange={() => setFormData(p => ({ ...p, autoContent: true }))} className="hidden" />
                        <span className={`font-semibold flex items-center ${formData.autoContent ? 'text-purple-400' : 'text-slate-400'}`}><Bot size={18} className="mr-2"/> AI Đề xuất</span>
                      </label>
                   </div>

                   {formData.autoContent ? (
                     <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-4 text-sm text-purple-200 flex items-start">
                       <Sparkles size={16} className="mt-0.5 mr-2 text-purple-400 flex-shrink-0"/> 
                       <span>AI sẽ tự động phân tích chủ đề và đề xuất nội dung chuẩn theo Chương trình GDPT 2018.</span>
                     </div>
                   ) : (
                      <TextArea label="" placeholder="Nhập nội dung chính..." name="keyContent" value={formData.keyContent} onChange={handleInputChange} error={errors.keyContent} required={!formData.autoContent} className="!mb-0" />
                   )}
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2.5 rounded-xl shadow-lg shadow-pink-500/20">
                    <Layers className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">2. Thành phần bổ trợ</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FEATURE_OPTIONS.map((feature) => (
                    <div 
                      key={feature.id} 
                      onClick={() => handleCheckboxChange(feature.id)}
                      className={`
                        flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all
                        ${formData.features.includes(feature.id) 
                          ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                          : 'border-slate-800 bg-slate-800/50 hover:border-slate-600'}
                      `}
                    >
                       <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${formData.features.includes(feature.id) ? 'bg-pink-500 border-pink-500' : 'border-slate-500'}`}>
                          {formData.features.includes(feature.id) && <CheckCircle size={14} className="text-white" />}
                       </div>
                       <span className={`text-sm font-medium ${formData.features.includes(feature.id) ? 'text-white' : 'text-slate-400'}`}>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-6">
                 <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                    <Palette className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">3. Phong cách nghệ thuật</h2>
                </div>
                <div className="p-1 bg-slate-800/50 rounded-2xl border border-white/5">
                  <Select label="" className="!mb-0" name="visualStyle" value={formData.visualStyle} onChange={handleInputChange} options={VISUAL_STYLES} placeholder="Chọn phong cách chủ đạo..." />
                </div>
                {formData.visualStyle === OTHER_STYLE_KEY && (
                  <div className="mt-4"><Input label="Mô tả phong cách mong muốn" name="customStyle" value={formData.customStyle} onChange={handleInputChange} error={errors.customStyle} /></div>
                )}
              </section>

              <div className="pt-6">
                <button
                  onClick={hasApiKeys ? generatePromptWithAI : () => setIsApiKeyModalOpen(true)}
                  disabled={isGenerating}
                  className={`
                    w-full relative overflow-hidden group flex items-center justify-center px-8 py-5 text-xl font-bold text-white rounded-2xl shadow-xl transition-all 
                    ${!hasApiKeys 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : (isGenerating 
                        ? 'bg-slate-800 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]')
                    }
                  `}
                >
                  {/* Button Glow Effect */}
                  {!isGenerating && hasApiKeys && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl blur-xl"></div>
                  )}

                  <span className="relative flex items-center">
                    {isGenerating ? (
                      <><Loader2 className="mr-3 animate-spin" size={28} /> Đang suy nghĩ...</> 
                    ) : !hasApiKeys ? (
                      <><Settings className="mr-3" size={28} /> Nhập API Key để bắt đầu</>
                    ) : (
                      <><Sparkles className="mr-3" size={28} /> TẠO SIÊU PROMPT</>
                    )}
                  </span>
                </button>
              </div>
           </div>
         </div>

         {/* RESULT */}
         {generatedPrompt && (
            <div ref={resultRef} className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 overflow-hidden ring-1 ring-cyan-500/20">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center text-white space-x-3">
                    <div className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                    <h3 className="text-lg font-bold tracking-wide uppercase text-cyan-400">Kết quả Prompt</h3>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={copyToClipboard} className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all border border-transparent ${isCopied ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'}`}>
                      {isCopied ? <><CheckCircle size={18} className="mr-2" /> Đã Copy</> : <><Copy size={18} className="mr-2" /> Copy</>}
                    </button>
                    <button 
                      onClick={handleCopyAndSwitchToImageGen}
                      className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
                    >
                      {isPro ? <LayoutDashboard size={18} className="mr-2" /> : <Settings size={18} className="mr-2" />} 
                      {isPro ? "Tạo Ảnh Ngay" : "Mở khóa Tạo Ảnh"}
                    </button>
                  </div>
                </div>
                <div className="relative">
                   <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
                   <textarea readOnly value={generatedPrompt} className="w-full h-96 p-8 bg-slate-950/50 text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar" />
                </div>
              </div>
            </div>
         )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500 selection:text-white relative">
      {/* GLOBAL BACKGROUND EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-float pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] animate-float pointer-events-none z-0" style={{animationDelay: '-3s'}}></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0"></div>

      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKeys} existingKeys={apiKeys} />
      <ProUpgradeModal isOpen={isProUpgradeModalOpen} onClose={() => setIsProUpgradeModalOpen(false)} onSuccess={handleProActivationSuccess} />

      {/* LEFT NAVIGATION */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
        userAvatar={userProfile.avatarUrl}
        onOpenProUpgrade={() => setIsProUpgradeModalOpen(true)}
        isPro={isPro}
      />

      {/* CENTER CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
         {/* HEADER */}
         <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-20 flex-shrink-0">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              {activeTab === 'create_prompt' && (currentPromptId ? 'Chỉnh sửa Prompt' : 'Tạo Prompt Mới')}
              {activeTab === 'create_image' && 'Tạo Hình Ảnh AI'}
              {activeTab === 'learn_ideas' && 'Học Ý Tưởng Phong Cách'}
              {activeTab === 'profile' && 'Cài đặt Hồ sơ'}
            </h1>
            <div className="flex items-center space-x-4">
               {activeTab === 'create_prompt' && (
                  <button onClick={saveCurrentPrompt} className="flex items-center px-4 py-2 bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <SaveIcon size={18} className="mr-2" /> Lưu Prompt
                  </button>
               )}
               <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl lg:hidden transition-colors">
                 <Menu size={24} />
               </button>
            </div>
         </header>

         {/* MAIN SCROLL AREA */}
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar scroll-smooth">
            {renderContent()}
         </main>
         
         {/* GENERATION LOADING OVERLAY */}
         {isGenerating && activeTab === 'create_prompt' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
               <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-cyan-500/30 max-w-md w-full text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]"></div>
                    <h3 className="text-2xl font-bold text-white mb-2">Đang suy nghĩ...</h3>
                    <p className="text-slate-400 mb-6">AI đang tối ưu hóa prompt của bạn</p>
                    <div className="w-full bg-slate-800 rounded-full h-3 mb-8 overflow-hidden border border-slate-700">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]" style={{ width: `${generationProgress}%` }}></div>
                    </div>
                    <button onClick={handleCancelGeneration} className="text-red-400 hover:text-red-300 font-bold flex items-center justify-center w-full transition-colors"><XCircle size={20} className="mr-2"/> Hủy bỏ</button>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* RIGHT HISTORY SIDEBAR */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        prompts={savedPrompts}
        currentPromptId={currentPromptId}
        onSelectPrompt={handleSelectPrompt}
        onNewPrompt={handleNewPrompt}
        onDeletePrompt={handleDeletePrompt}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};

export default App;