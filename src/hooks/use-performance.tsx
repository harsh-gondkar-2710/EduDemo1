
'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode,
  FC,
  useCallback,
  useMemo,
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

type TopicPerformanceData = {
    topic: string;
    strength: number;
}

interface PerformanceContextType {
  progressData: ProgressData[];
  topicPerformanceData: TopicPerformanceData[];
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
  addSessionData: (sessionData: SessionData) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

// Initial mock data
const initialProgressData: ProgressData[] = [
    { date: 'Day 1', score: 60 },
    { date: 'Day 2', score: 65 },
    { date: 'Day 3', score: 75 },
    { date: 'Day 4', score: 70 },
    { date: 'Day 5', score: 85 },
    { date: 'Day 6', score: 90 },
];
  
const initialTopicPerformanceData: TopicPerformanceData[] = [
    { topic: 'Maths', strength: 95 },
    { topic: 'Indian History', strength: 80 },
    { topic: 'Social Studies', strength: 75 },
    { topic: 'GK', strength: 70 },
    { topic: 'Sciences', strength: 60 },
];

export const PerformanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>(initialProgressData);
  const [topicPerformanceData, setTopicPerformanceData] = useState<TopicPerformanceData[]>(initialTopicPerformanceData);

  const addSessionData = useCallback((sessionData: SessionData) => {
    // 1. Update progress data
    setProgressData(prev => [
      ...prev,
      { date: `Day ${prev.length + 1}`, score: sessionData.score },
    ]);

    // 2. Update topic performance data
    const topicStats: { [key: string]: { correct: number, total: number } } = {};

    sessionData.performanceHistory.forEach(record => {
      if (!topicStats[record.subject]) {
        topicStats[record.subject] = { correct: 0, total: 0 };
      }
      topicStats[record.subject].total += 1;
      if (record.correct) {
        topicStats[record.subject].correct += 1;
      }
    });

    setTopicPerformanceData(prev => {
        const newData = [...prev];
        Object.entries(topicStats).forEach(([subject, stats]) => {
            if (stats.total > 0) {
                const topicIndex = newData.findIndex(t => t.topic === subject);
                const sessionStrength = (stats.correct / stats.total) * 100;

                if (topicIndex !== -1) {
                    const oldStrength = newData[topicIndex].strength;
                    // Weighted average, giving new session more weight
                    newData[topicIndex].strength = (oldStrength * 2 + sessionStrength) / 3;
                } else {
                    // Add new subject if it doesn't exist
                    newData.push({ topic: subject, strength: sessionStrength });
                }
            }
        });
        return newData;
    });

  }, []);
  
  const overallProgress = useMemo(() => {
    if (progressData.length === 0) return 0;
    const totalScore = progressData.reduce((acc, curr) => acc + curr.score, 0);
    return totalScore / progressData.length;
  }, [progressData]);

  const { strengths, weaknesses } = useMemo(() => {
    const sortedTopics = [...topicPerformanceData].sort((a, b) => b.strength - a.strength);
    return {
        strengths: sortedTopics.slice(0, 1).map(t => t.topic),
        weaknesses: sortedTopics.slice(-1).map(t => t.topic),
    }
  }, [topicPerformanceData]);

  const value = {
    progressData,
    topicPerformanceData,
    overallProgress,
    strengths,
    weaknesses,
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
