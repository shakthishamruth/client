import React from 'react';

interface SkillDNAData {
  solved_easy: number;
  solved_medium: number;
  solved_hard: number;
  total_easy: number;
  total_medium: number;
  total_hard: number;
  total_submissions: number;
  daily_submission_log: Array<{ date: string; count: number }>;
  streak_history: { current_streak: number; max_streak: number };
  language_usage_stats: Record<string, number>;
  avg_attempts_per_problem?: number;
  contest_data?: {
    contest_start_time: number;
    contest_duration: number;
    problems_solved: Array<{
      solve_timestamp: number;
      attempts?: number;
    }>;
  };
}

interface RadarScores {
  languages: number;
  beginner: number;
  intermediate: number;
  expert: number;
  speed: number;
  consistency: number;
  topLanguage: string;
}

// Global averages (these would come from backend analytics)
const GLOBAL_AVERAGES = {
  easy_solved: 25,
  medium_solved: 15,
  hard_solved: 5
};

function computeContestSpeed(contestData?: SkillDNAData['contest_data']): number {
  if (!contestData || contestData.problems_solved.length === 0) {
    return 0;
  }

  const { contest_start_time, contest_duration, problems_solved } = contestData;
  
  // Compute solve times for each problem
  const solveTimes = problems_solved.map(problem => 
    problem.solve_timestamp - contest_start_time
  );
  
  // Average solve time
  const avgSolveTime = solveTimes.reduce((sum, time) => sum + time, 0) / solveTimes.length;
  
  // Normalize against contest duration
  const timeRatio = Math.min(1, avgSolveTime / contest_duration);
  
  // Base speed score (0-100)
  let speedScore = (1 - timeRatio) * 100;
  
  // Optional accuracy balancing if attempts data exists
  const hasAttempts = problems_solved.every(p => p.attempts !== undefined);
  if (hasAttempts) {
    const avgAttempts = problems_solved.reduce((sum, p) => sum + (p.attempts || 1), 0) / problems_solved.length;
    speedScore = (1 - timeRatio) * 80 + (1 / avgAttempts) * 20;
  }
  
  return Math.max(0, Math.min(100, speedScore));
}

function computeSkillDNA(data: SkillDNAData): RadarScores {
  // 1. Beginner Skill Score
  const beginnerScore = data.total_easy > 0 ? Math.min(100, (data.solved_easy / data.total_easy) * 100) : 0;
  
  // 2. Intermediate Skill Score  
  const intermediateScore = data.total_medium > 0 ? Math.min(100, (data.solved_medium / data.total_medium) * 100) : 0;
  
  // 3. Expert Skill Score
  const expertScore = data.total_hard > 0 ? Math.min(100, (data.solved_hard / data.total_hard) * 100) : 0;
  
  // 4. Languages Score (Preference Strength)
  const languageEntries = Object.entries(data.language_usage_stats);
  const topLanguageEntry = languageEntries.reduce((max, curr) => curr[1] > max[1] ? curr : max, ['None', 0]);
  const topLanguage = topLanguageEntry[0];
  const languageScore = data.total_submissions > 0 
    ? (topLanguageEntry[1] / data.total_submissions) * 100 
    : 0;
  
  // 5. Speed Score (Contest Performance)
  const speedScore = computeContestSpeed(data.contest_data);
  
  // 6. Consistency Score (Practice Habit)
  const activeDaysLast90 = data.daily_submission_log
    .filter(log => {
      const logDate = new Date(log.date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && log.count > 0;
    }).length;
  
  const consistencyScore = (activeDaysLast90 / 90 * 50) + 
    (data.streak_history.current_streak / Math.max(1, data.streak_history.max_streak) * 50);
  
  // Convert to radar scale (1-5)
  return {
    languages: Math.round(Math.min(100, languageScore) / 20),
    beginner: Math.round(Math.min(100, beginnerScore) / 20),
    intermediate: Math.round(Math.min(100, intermediateScore) / 20),
    expert: Math.round(Math.min(100, expertScore) / 20),
    speed: Math.round(Math.min(100, speedScore) / 20),
    consistency: Math.round(Math.min(100, consistencyScore) / 20),
    topLanguage
  };
}

interface SkillDNARadarProps {
  data: SkillDNAData;
  className?: string;
}

export function SkillDNARadar({ data, className = "" }: SkillDNARadarProps) {
  const scores = computeSkillDNA(data);
  
  const skills = [
    { label: "Beginner", value: scores.beginner, angle: 0 },
    { label: "Intermediate", value: scores.intermediate, angle: 60 },
    { label: "Expert", value: scores.expert, angle: 120 },
    { label: "Languages", value: scores.languages, angle: 180 },
    { label: "Speed", value: scores.speed, angle: 240 },
    { label: "Consistency", value: scores.consistency, angle: 300 }
  ];
  
  const points = skills.map(skill => {
    const rad = (skill.angle - 90) * Math.PI / 180;
    const radius = (skill.value / 5) * 60; // Reduced radius for better padding
    return {
      x: 120 + radius * Math.cos(rad),
      y: 120 + radius * Math.sin(rad)
    };
  });
  
  const pathData = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') + ' Z';
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Radar Chart */}
      <div className="flex-1 px-4 py-6">
        <svg viewBox="0 0 240 240" className="w-full h-full max-h-72">
          {/* Background grid circles */}
          {[1, 2, 3, 4, 5].map(level => (
            <circle 
              key={level}
              cx="120" 
              cy="120" 
              r={level * 12} 
              fill="none" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth="1" 
              strokeOpacity="0.15"
            />
          ))}
          
          {/* Grid lines */}
          {skills.map((skill, i) => {
            const rad = (skill.angle - 90) * Math.PI / 180;
            const endX = 120 + 60 * Math.cos(rad);
            const endY = 120 + 60 * Math.sin(rad);
            return (
              <line 
                key={i}
                x1="120" 
                y1="120" 
                x2={endX} 
                y2={endY} 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth="1" 
                strokeOpacity="0.15"
              />
            );
          })}
          
          {/* Skill polygon */}
          <path 
            d={pathData} 
            fill="hsl(var(--primary))" 
            fillOpacity="0.15" 
            stroke="hsl(var(--primary))" 
            strokeWidth="2"
          />
          
          {/* Skill points and labels */}
          {skills.map((skill, i) => {
            const rad = (skill.angle - 90) * Math.PI / 180;
            const radius = (skill.value / 5) * 60;
            const x = 120 + radius * Math.cos(rad);
            const y = 120 + radius * Math.sin(rad);
            const labelX = 120 + 80 * Math.cos(rad);
            const labelY = 120 + 80 * Math.sin(rad);
            
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-current"
                  fontSize="11"
                >
                  {skill.label}
                </text>
                <text
                  x={labelX}
                  y={labelY + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-primary"
                  fontSize="9"
                >
                  {skill.value}/5
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
    </div>
  );
}