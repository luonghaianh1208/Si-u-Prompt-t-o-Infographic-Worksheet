import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth = true, className = '', ...props }) => {
  return (
    <div className={`mb-6 ${fullWidth ? 'w-full' : ''}`}>
      <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
        {label} {props.required && <span className="text-red-400">*</span>}
      </label>
      <input
        className={`
          w-full px-4 py-3 bg-slate-800/50 text-white border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
            : 'border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-slate-600'}
          placeholder-slate-500
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-400 font-medium flex items-center"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>{error}</p>}
    </div>
  );
};