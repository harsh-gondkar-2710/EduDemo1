
'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode,
  FC,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

type PerformanceRecord = {
  question: string;
  correct: boolean;
  timeTaken: number;
  subject: string;
};

type SessionData = {
    score: number;
    performanceHistory: PerformanceRecord[];
}

type ProgressData = {
    date: string;
    score: number;
}

type Goal = {
    id: number;
    text: string;
    completed: boolean;
    deadline: string | null;
  };

interface PerformanceContextType {
  progressData: ProgressData[];
  sessionCount: number;
  overallProgress: number;
  completedGoalsCount: number;
  addSessionData: (sessionData: SessionData) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

// Sample data for demonstration
const initialProgressData: ProgressData[] = [
    { date: 'Day 1', score: 75 },
    { date: 'Day 2', score: 80 },
    { date: 'Day 3', score: 70 },
    { date: 'Day 4', score: 85 },
    { date: 'Day 5', score: 90 },
];

export const PerformanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>(initialProgressData);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
        const storedGoals = localStorage.getItem('studyGoals');
        if (storedGoals) {
            try {
                const parsedGoals: Goal[] = JSON.parse(storedGoals);
                setCompletedGoalsCount(parsedGoals.filter(g => g.completed).length);
            } catch (e) {
                console.error("Failed to parse study goals for dashboard", e);
            }
        }
    };

    handleStorageChange(); // Initial check
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studyGoalsUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('studyGoalsUpdated', handleStorageChange);
    };

  }, []);

  const addSessionData = useCallback((sessionData: SessionData) => {
    setProgressData(prev => [...prev, { date: `Day ${prev.length + 1}`, score: sessionData.score }]);
  }, []);
  
  const overallProgress = useMemo(() => {
    if (progressData.length === 0) return 0;
    const totalScore = progressData.reduce((acc, curr) => acc + curr.score, 0);
    return totalScore / progressData.length;
  }, [progressData]);

  const sessionCount = useMemo(() => progressData.length, [progressData]);

  const value = {
    progressData,
    sessionCount,
    overallProgress,
    completedGoalsCount,
    addSessionData,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
