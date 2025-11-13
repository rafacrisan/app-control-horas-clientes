import React from 'react';
import { Company } from '../types.ts';
import { formatTime } from '../utils.ts';

interface CompanyButtonProps {
  company: Company;
  time: number;
  isActive: boolean;
  onClick: (id: number) => void;
}

const CompanyButton: React.FC<CompanyButtonProps> = ({ company, time, isActive, onClick }) => {
  const baseClasses = "p-4 rounded-lg shadow-md transition-all duration-300 text-left w-full flex justify-between items-center";
  const stateClasses = isActive 
    ? "bg-indigo-600 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900" 
    : "bg-gray-800 hover:bg-gray-700";

  return (
    <button onClick={() => onClick(company.id)} className={`${baseClasses} ${stateClasses}`}>
      <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{company.name}</span>
      <span className={`text-sm font-mono ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{formatTime(time)}</span>
    </button>
  );
};

export default CompanyButton;