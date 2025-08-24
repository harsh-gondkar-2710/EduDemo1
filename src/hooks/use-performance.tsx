
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
import { useAuth } from './use-auth';

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

export const PerformanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const { user } = useAuth();

  const getStorageKey = (key: string) => user ? `${key}_${user.uid}` : null;

  // Load data from localStorage when user changes
  useEffect(() => {
    if (!user) {
        setProgressData([]);
        setCompletedGoalsCount(0);
        return;
    };
    
    const performanceKey = getStorageKey('performanceData');
    const goalsKey = getStorageKey('studyGoals');

    const storedPerformance = performanceKey ? localStorage.getItem(performanceKey) : null;
    if (storedPerformance) {
        try {
            setProgressData(JSON.parse(storedPerformance));
        } catch(e) {
            console.error("Failed to parse performance data", e);
            if (performanceKey) localStorage.removeItem(performanceKey);
        }
    } else {
        setProgressData([]);
    }

    const storedGoals = goalsKey ? localStorage.getItem(goalsKey) : null;
    if (storedGoals) {
        try {
            const parsedGoals: Goal[] = JSON.parse(storedGoals);
            setCompletedGoalsCount(parsedGoals.filter(g => g.completed).length);
        } catch (e) {
            console.error("Failed to parse study goals for dashboard", e);
        }
    } else {
        setCompletedGoalsCount(0);
    }
  }, [user]);

  // Sync goals count with localStorage changes from the goals page
  useEffect(() => {
    const handleStorageChange = () => {
        const goalsKey = getStorageKey('studyGoals');
        if (!goalsKey) return;
        const storedGoals = localStorage.getItem(goalsKey);
        if (storedGoals) {
            try {
                const parsedGoals: Goal[] = JSON.parse(storedGoals);
                setCompletedGoalsCount(parsedGoals.filter(g => g.completed).length);
            } catch (e) {
                console.error("Failed to parse study goals for dashboard", e);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studyGoalsUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('studyGoalsUpdated', handleStorageChange);
    };

  }, [user]);

  const addSessionData = useCallback((sessionData: SessionData) => {
    const performanceKey = getStorageKey('performanceData');
    if (!performanceKey) return;

    setProgressData(prev => {
        const newData = [...prev, { date: `Day ${prev.length + 1}`, score: sessionData.score }];
        localStorage.setItem(performanceKey, JSON.stringify(newData));
        return newData;
    });
  }, [user]);
  
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
