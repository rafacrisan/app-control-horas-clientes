import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Company, TimeLog, Comment, AppState } from './types.ts';
import CompanyButton from './components/TodoItem.tsx';
import CompanyManager from './components/AIAssist.tsx';
import CommentManager from './components/CommentManager.tsx';
import { formatTime } from './utils.ts';

const initialCompanies: Company[] = [
  { id: 1, name: "Google", isFavorite: true, lastUsed: null },
  { id: 2, name: "Facebook", isFavorite: true, lastUsed: null },
  { id: 3, name: "Amazon", isFavorite: true, lastUsed: null },
  { id: 4, name: "Netflix", isFavorite: true, lastUsed: null },
  { id: 5, name: "Apple", isFavorite: true, lastUsed: null },
  { id: 6, name: "Microsoft", isFavorite: false, lastUsed: null },
  { id: 7, name: "Tesla", isFavorite: false, lastUsed: null },
];

const LOCAL_STORAGE_KEY = 'companyTimeTrackerData';

function App() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [timeLog, setTimeLog] = useState<TimeLog>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState: AppState = JSON.parse(savedStateJSON);
        if (savedState.companies && savedState.timeLog && savedState.comments) {
          setCompanies(savedState.companies);
          setTimeLog(savedState.timeLog);
          setComments(savedState.comments);
        }
      }
    } catch (error) {
      console.error("Failed to load data from local storage:", error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const appState: AppState = { companies, timeLog, comments };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.error("Failed to save data to local storage:", error);
    }
  }, [companies, timeLog, comments]);

  // Timer effect
  useEffect(() => {
    if (activeCompanyId === null) return;
    const timer = setInterval(() => {
      setTimeLog(prevLog => ({
        ...prevLog,
        [activeCompanyId]: (prevLog[activeCompanyId] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCompanyId]);

  const handleSelectCompany = useCallback((id: number) => {
    setCompanies(prevCompanies =>
      prevCompanies.map(c =>
        c.id === id ? { ...c, lastUsed: Date.now() } : c
      )
    );
    setActiveCompanyId(prevId => (prevId === id ? null : id));
  }, []);

  const handleAddCompany = useCallback((name: string) => {
    const newCompany: Company = {
      id: Date.now(),
      name,
      isFavorite: false,
      lastUsed: Date.now(),
    };
    setCompanies(prev => [...prev, newCompany]);
    setActiveCompanyId(newCompany.id);
  }, []);

  const handleAddComment = useCallback((text: string) => {
    if (!activeCompanyId || !text.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      companyId: activeCompanyId,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setComments(prev => [...prev, newComment]);
  }, [activeCompanyId]);
  
  const handleEditComment = useCallback((commentId: number, newText: string) => {
    if (!newText.trim()) return;
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId ? { ...comment, text: newText.trim() } : comment
      )
    );
  }, []);

  const handleSaveDatabase = () => {
    const appState: AppState = { companies, timeLog, comments };
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `company-time-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const restoredState: AppState = JSON.parse(text);
          if (restoredState.companies && restoredState.timeLog && restoredState.comments) {
            setCompanies(restoredState.companies);
            setTimeLog(restoredState.timeLog);
            setComments(restoredState.comments);
            setActiveCompanyId(null); // Reset active company
            alert('Database restored successfully!');
          } else {
            throw new Error('Invalid backup file format.');
          }
        }
      } catch (error) {
        console.error("Failed to restore database:", error);
        alert('Failed to restore database. Please select a valid backup file.');
      } finally {
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };


  const favoriteCompanies = useMemo(() =>
    companies.filter(c => c.isFavorite).slice(0, 5),
    [companies]
  );

  const recentCompanies = useMemo(() =>
    companies
      .filter(c => !c.isFavorite && c.lastUsed)
      .sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0))
      .slice(0, 5),
    [companies]
  );

  const activeCompany = useMemo(() =>
    companies.find(c => c.id === activeCompanyId),
    [companies, activeCompanyId]
  );
  
  const commentsForActiveCompany = useMemo(() => {
    if (!activeCompanyId) return [];
    return comments
      .filter(c => c.companyId === activeCompanyId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [comments, activeCompanyId]);


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Company Time Tracker
          </h1>
          <p className="text-gray-400 mt-2">Click a company to start the timer.</p>
        </header>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          {activeCompany ? (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Currently timing</span>
                <p className="text-2xl font-bold text-indigo-300 truncate max-w-full">{activeCompany.name}</p>
                <p className="text-3xl font-mono text-white tracking-wider">{formatTime(timeLog[activeCompany.id] || 0)}</p>
              </div>
              <CommentManager 
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                comments={commentsForActiveCompany} 
              />
            </div>
          ) : (
            <div className="min-h-[96px] flex items-center justify-center">
              <p className="text-gray-500">Timer paused. Select a company to begin.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-indigo-400">Favorites</h2>
            <ul className="space-y-3">
              {favoriteCompanies.map(company => (
                <li key={company.id}>
                  <CompanyButton
                    company={company}
                    time={timeLog[company.id] || 0}
                    isActive={activeCompanyId === company.id}
                    onClick={handleSelectCompany}
                  />
                </li>
              ))}
            </ul>
          </div>

          {recentCompanies.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-purple-400">Recent</h2>
              <ul className="space-y-3">
                {recentCompanies.map(company => (
                  <li key={company.id}>
                    <CompanyButton
                      company={company}
                      time={timeLog[company.id] || 0}
                      isActive={activeCompanyId === company.id}
                      onClick={handleSelectCompany}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <CompanyManager
          companies={companies}
          onAddCompany={handleAddCompany}
          onSelectCompany={handleSelectCompany}
        />

        <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-green-400">Data Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleSaveDatabase} className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition">
              Save Backup
            </button>
            <label className="w-full text-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition cursor-pointer">
              Restore Backup
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleRestoreDatabase} className="hidden" />
            </label>
          </div>
        </div>


        <footer className="text-center mt-8 text-xs text-gray-600">
          <p>Powered by React and Vite.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;