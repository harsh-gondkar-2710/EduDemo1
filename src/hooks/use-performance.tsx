
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
  age: number | null;
  setAge: (age: number) => void;
  loading: boolean;
  addSessionData: (sessionData: SessionData) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const [age, setAgeState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const getStorageKey = (key: string) => user ? `${key}_${user.uid}` : null;

  useEffect(() => {
    if (user) {
        setLoading(true);
        // Load persisted progress data for the logged-in user
        const progressKey = getStorageKey('progressData');
        const storedProgress = progressKey ? localStorage.getItem(progressKey) : null;
        if (storedProgress) {
            try {
                setProgressData(JSON.parse(storedProgress));
            } catch (e) {
                console.error("Failed to parse progress data from localStorage", e);
                localStorage.removeItem(progressKey!);
            }
        } else {
            setProgressData([]); // Reset for new user
        }
        
        // Load age
        const ageKey = getStorageKey('userAge');
        const storedAge = ageKey ? localStorage.getItem(ageKey) : null;
        if (storedAge) {
            setAgeState(parseInt(storedAge, 10));
        } else {
            setAgeState(null); // Reset for new user
        }
        setLoading(false);
    } else {
        // Clear data if user logs out
        setProgressData([]);
        setAgeState(null);
        setCompletedGoalsCount(0);
    }

    const handleStorageChange = () => {
        const goalsKey = getStorageKey('studyGoals');
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
    };

    handleStorageChange(); // Initial check
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studyGoalsUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('studyGoalsUpdated', handleStorageChange);
    };

  }, [user]);
  
  const setAge = (newAge: number) => {
    setAgeState(newAge);
    const ageKey = getStorageKey('userAge');
    if (ageKey) {
        localStorage.setItem(ageKey, newAge.toString());
    }
  }

  const addSessionData = useCallback((sessionData: SessionData) => {
    setProgressData(prev => {
        const newData = [...prev, { date: `Day ${prev.length + 1}`, score: sessionData.score }];
        const progressKey = getStorageKey('progressData');
        if (progressKey) {
            localStorage.setItem(progressKey, JSON.stringify(newData));
        }
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
    age,
    setAge,
    loading,
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
