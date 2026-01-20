import { API_BASE_URL } from '@/config/api';

// Simple cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCached = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

export interface Submission {
  _id: string;
  problemId: string;
  problemNumber: number;
  title: string;
  language: string;
  submittedCode: string;
  status: 'RUN' | 'ATTEMPTED' | 'SOLVED';
  passedCount: number;
  totalCount: number;
  submittedAt: string;
}

export interface SubmissionResponse {
  submissions: Submission[];
}

// API Response Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalScore: number;
}

export interface LeaderboardResponse {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  leaderboard: LeaderboardEntry[];
}

export interface UserProfile {
  basicInfo: {
    userId: string;
    role: string;
    joinedAt: string;
  };
  problemStats: {
    totalSolved: number;
    difficultyStats: any;
    languageStats: Record<string, number>;
    solvedProblems?: Array<{
      problemId: {
        _id: string;
        title: string;
      };
      difficulty: string;
      language: string;
      solvedAt: string;
    }>;
  };
  contestStats: {
    contestsPlayed: number;
    totalScore: number;
    bestScore: number;
    averageScore: number;
  };
  leaderboard: {
    rank: number | null;
    totalUsers: number;
    percentile: string | null;
  };
  activity: {
    period: string;
    totalSubmissions: number;
    activeDays: number;
  };
  calendar: {
    data: Array<{ date: string; count: number }>;
  };
}

export interface Topic {
  _id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  problemIds: string[];
}

export interface Problem {
  _id: string;
  problemId: number;
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  topic: string;
  tags?: string[];
  constraints?: string;
  sampleTestCases: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  points: number;
  createdAt: string;
}

// API Functions
export const api = {
  // Leaderboard
  async getLeaderboard(page = 1, limit = 10): Promise<LeaderboardResponse> {
    const cacheKey = `leaderboard_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `profile_${userId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  // Topics (we'll need to create this endpoint)
  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_BASE_URL}/topics`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    return response.json();
  },

  // Problems by topic (we'll need to create this endpoint)
  async getProblemsByTopic(topicId: string, userId?: string): Promise<Problem[]> {
    const cacheKey = `problems_topic_${topicId}_${userId || 'guest'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const url = userId 
      ? `${API_BASE_URL}/topics/${topicId}/problems?userId=${userId}`
      : `${API_BASE_URL}/topics/${topicId}/problems`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch problems');
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  // All problems (we'll need to create this endpoint)
  async getProblems(userId?: string): Promise<any> {
    const cacheKey = `problems_all_${userId || 'guest'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const url = userId 
      ? `${API_BASE_URL}/user/problems?userId=${userId}`
      : `${API_BASE_URL}/user/problems`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch problems');
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  // Submit code for validation
  async submitCode(problemId: string, userId: string, code: string, language: string) {
    const response = await fetch(`${API_BASE_URL}/submit/${problemId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, code, language }),
    });
    if (!response.ok) throw new Error('Failed to submit code');
    return response.json();
  },

  // Generic POST method
  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },

  // Generic GET method
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },

  // Get user submissions
  async getUserSubmissions(userId: string): Promise<SubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/submissions/${userId}/recent-submissions`);
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  }
};