import React, { useState, useMemo } from 'react';
import { Company } from '../types.ts';

interface CompanyManagerProps {
  companies: Company[];
  onAddCompany: (name: string) => void;
  onSelectCompany: (id: number) => void;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, onAddCompany, onSelectCompany }) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onAddCompany(newCompanyName.trim());
    setNewCompanyName('');
  };

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return companies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, companies]);

  return (
    <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-purple-400">Manage Companies</h3>
      
      {/* Add Company Form */}
      <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="Add a new company..."
          className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition"
        >
          Add Company
        </button>
      </form>

      {/* Search Companies */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search existing companies..."
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        {searchTerm && (
          <ul className="mt-2 bg-gray-900/50 rounded-md max-h-48 overflow-y-auto">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <li key={company.id}>
                  <button 
                    onClick={() => {
                      onSelectCompany(company.id);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-800/50 transition duration-150"
                  >
                    {company.name}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No companies found.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CompanyManager;