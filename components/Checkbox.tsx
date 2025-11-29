import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        className={`w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer ${className}`}
        {...props}
      />
      <label className="ml-2 block text-sm text-slate-700 cursor-pointer" onClick={(e) => {
        // Prevent double toggle if label is clicked
         const input = e.currentTarget.previousElementSibling as HTMLInputElement;
         if (input) input.click();
      }}>
        {label}
      </label>
    </div>
  );
};