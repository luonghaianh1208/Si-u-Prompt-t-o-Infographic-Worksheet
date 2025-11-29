import React, { useState } from 'react';
import { X, Crown, Loader2, CheckCircle, AlertCircle, Phone, School, User } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Google Apps Script API URL provided by the user
  const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwo3d6m6KxXwwGVByOdMQfBy3HaqVlv0CkQ-MeO93qMVCph4fs2NqEzOXMeS2d5Q1z3/exec";

  const handleActivate = async () => {
    if (!code.trim()) {
      setStatus('error');
      setMessage('Vui lòng nhập mã kích hoạt.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const fullUrl = `${GAS_API_URL}?code=${encodeURIComponent(code.trim())}`;
      
      const response = await fetch(fullUrl, {
        method: "GET",
        redirect: "follow"
      });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Kích hoạt thành công!');
        setTimeout(() => {
            onSuccess();
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Mã kích hoạt không hợp lệ.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (status !== 'loading' && status !== 'success') {
        handleActivate();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Crown size={24} className="fill-yellow-200" />
            <h3 className="font-bold text-lg">Nâng cấp Siêu Prompt PRO</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Nhập mã bản quyền để mở khóa toàn bộ tính năng cao cấp của Siêu Prompt.</p>
            
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setStatus('idle');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mã kích hoạt (VD: KEY-001)"
                className={`
                  w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-center font-mono font-medium text-lg focus:outline-none transition-all
                  ${status === 'error' ? 'border-red-300 focus:border-red-500 text-red-600' : 'border-slate-200 focus:border-amber-500 text-slate-800'}
                  ${status === 'success' ? 'border-green-500 text-green-700' : ''}
                `}
              />
            </div>

            {/* Status Message */}
            {(status === 'error' || status === 'success') && (
              <div className={`mt-3 flex items-center justify-center text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {status === 'success' ? <CheckCircle size={16} className="mr-1.5" /> : <AlertCircle size={16} className="mr-1.5" />}
                {message}
              </div>
            )}
          </div>

          <button
            onClick={handleActivate}
            disabled={status === 'loading' || status === 'success'}
            className={`
              w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center
              ${status === 'loading' ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}
            `}
          >
            {status === 'loading' ? (
              <><Loader2 size={20} className="animate-spin mr-2" /> Đang kiểm tra...</>
            ) : status === 'success' ? (
              <><CheckCircle size={20} className="mr-2" /> Đã kích hoạt</>
            ) : (
              'Kích hoạt ngay'
            )}
          </button>
        </div>

        {/* Footer Contact Info */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 text-sm text-slate-600">
          <h4 className="font-semibold text-slate-800 mb-2">Liên hệ mua bản quyền (License Key):</h4>
          <div className="space-y-2">
            <div className="flex items-start">
              <User size={16} className="text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Thầy giáo: <strong>Lương Hải Anh</strong></span>
            </div>
            <div className="flex items-start">
              <School size={16} className="text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Đơn vị: THPT Chuyên Nguyễn Trãi</span>
            </div>
            <div className="flex items-start">
              <Phone size={16} className="text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>SĐT/Zalo: <a href="tel:0328186264" className="text-indigo-600 font-bold hover:underline">0328186264</a></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};