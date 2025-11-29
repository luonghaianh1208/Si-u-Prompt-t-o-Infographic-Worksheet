import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-6 w-full">
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 bg-slate-800/50 text-white border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
            : 'border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-slate-600'}
          placeholder-slate-500
          ${className}
        `}
        rows={4}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-400 font-medium flex items-center"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>{error}</p>}
    </div>
  );
};