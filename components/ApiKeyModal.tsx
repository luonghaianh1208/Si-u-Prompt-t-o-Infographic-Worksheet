import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink, Loader2, Plus, Trash2, Eye, EyeOff, ShieldCheck, Save } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: string[]) => void;
  existingKeys: string[];
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, existingKeys }) => {
  const [keys, setKeys] = useState<string[]>(['']);
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'none' | 'success' | 'error'>('none');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKeys(existingKeys.length > 0 ? existingKeys : ['']);
      setVisibleKeys({});
      setCheckStatus('none');
      setMessage(null);
    }
  }, [isOpen, existingKeys]);

  const handleChange = (index: number, value: string) => {
    // Auto-detect multi-line paste
    if (value.includes('\n')) {
      const pastedKeys = value.split('\n').map(k => k.trim()).filter(k => k.length > 0);
      const newKeys = [...keys];
      // Replace current index with the first pasted key, insert others after
      newKeys.splice(index, 1, ...pastedKeys);
      setKeys(newKeys);
    } else {
      const newKeys = [...keys];
      newKeys[index] = value;
      setKeys(newKeys);
    }
    setCheckStatus('none');
    setMessage(null);
  };

  const handleAddKey = () => {
    setKeys([...keys, '']);
  };

  const handleRemoveKey = (index: number) => {
    const newKeys = keys.filter((_, i) => i !== index);
    setKeys(newKeys.length ? newKeys : ['']);
    setCheckStatus('none');
  };

  const toggleVisibility = (index: number) => {
    setVisibleKeys(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleVerify = async () => {
    const validKeys = keys.map(k => k.trim()).filter(k => k.length > 0);
    if (validKeys.length === 0) {
      setCheckStatus('error');
      setMessage("Vui lòng nhập ít nhất một API Key để kiểm tra.");
      return;
    }

    setIsChecking(true);
    setCheckStatus('none');
    setMessage(null);

    try {
      // Test the first key to validate connection
      const ai = new GoogleGenAI({ apiKey: validKeys[0] });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Test connection',
      });
      setCheckStatus('success');
      setMessage("Kết nối thành công! API Key hoạt động tốt.");
    } catch (err: any) {
      console.error("API Verification Failed", err);
      setCheckStatus('error');
      setMessage("Kết nối thất bại. Vui lòng kiểm tra lại Key.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    const validKeys = keys.map(k => k.trim()).filter(k => k.length > 0);
    onSave(validKeys);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-green-400" size={24} />
            <h3 className="text-white font-bold text-lg">Cấu hình API Keys</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1">Quản lý nhiều API Key</h4>
            <p className="text-xs text-indigo-700">
              Hệ thống sẽ tự động xoay vòng sử dụng các Key để tránh lỗi giới hạn (Rate Limit). 
              Các Key được lưu trữ an toàn trên trình duyệt của bạn.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Danh sách Key</label>
                <span className="text-xs text-slate-400">{keys.length} keys</span>
            </div>
            
            {keys.map((key, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys[index] ? "text" : "password"}
                    value={key}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder="Dán API Key vào đây (AIza...)"
                    className={`
                      w-full pl-3 pr-10 py-2.5 bg-white border rounded-lg text-sm font-mono transition-all
                      ${checkStatus === 'error' ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
                      focus:outline-none
                    `}
                  />
                  <button
                    onClick={() => toggleVisibility(index)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {visibleKeys[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveKey(index)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa Key này"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddKey}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 px-1"
            >
              <Plus size={16} className="mr-1" /> Thêm Key mới
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-3 rounded-lg flex items-start text-sm ${checkStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {checkStatus === 'success' ? <CheckCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center hover:underline"
            >
              Lấy Key tại Google AI Studio <ExternalLink size={10} className="ml-1" />
            </a>

            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleVerify}
                disabled={isChecking}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors
                  ${isChecking ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {isChecking ? <Loader2 size={18} className="animate-spin" /> : 'Kiểm tra'}
              </button>

              <button
                onClick={handleSave}
                disabled={isChecking}
                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Save size={18} className="mr-2" /> Lưu lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
