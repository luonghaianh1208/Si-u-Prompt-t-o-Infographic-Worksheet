import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, placeholder, className = '', ...props }) => {
  return (
    <div className="mb-6 w-full">
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 bg-slate-800/50 text-white border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 appearance-none
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-slate-600'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">{placeholder || "Chọn một tùy chọn..."}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-white py-2">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400 font-medium flex items-center"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>{error}</p>}
    </div>
  );
};