
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
  age: number | null;
  setAge: (age: number) => void;
  isAgeGateOpen: boolean;
  setAgeGateOpen: (isOpen: boolean) => void;
  addSessionData: (sessionData: SessionData) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const [age, setAgeState] = useState<number | null>(null);
  const [isAgeGateOpen, setAgeGateOpen] = useState(false);

  useEffect(() => {
    // Load persisted progress data
    const storedProgress = localStorage.getItem('progressData');
    if (storedProgress) {
      try {
        setProgressData(JSON.parse(storedProgress));
      } catch (e) {
        console.error("Failed to parse progress data from localStorage", e);
        localStorage.removeItem('progressData');
      }
    }
    
    const storedAge = localStorage.getItem('userAge');
    if (storedAge) {
      setAgeState(parseInt(storedAge, 10));
    }

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
    window.addEventListener('storage', handleStorageChange); // Listen for changes from other tabs
    
    // Custom event listener for same-tab updates
    window.addEventListener('studyGoalsUpdated', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('studyGoalsUpdated', handleStorageChange);
    };

  }, []);
  
  const setAge = (newAge: number) => {
    setAgeState(newAge);
    localStorage.setItem('userAge', newAge.toString());
    setAgeGateOpen(false);
  }

  const addSessionData = useCallback((sessionData: SessionData) => {
    setProgressData(prev => {
        const newData = [...prev, { date: `Day ${prev.length + 1}`, score: sessionData.score }];
        localStorage.setItem('progressData', JSON.stringify(newData));
        return newData;
    });

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
    age,
    setAge,
    isAgeGateOpen,
    setAgeGateOpen,
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
