export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type FoodQuality = 'poor' | 'fair' | 'good' | 'excellent';

export const MOOD_LABELS: Record<MoodScore, string> = {
  1: 'Awful',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Amazing',
};

export const MOOD_EMOJI: Record<MoodScore, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '🤩',
};

export const MOOD_COLOR: Record<MoodScore, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
};

export const PAIN_LOCATIONS = [
  'Head', 'Neck', 'Shoulders', 'Back', 'Chest',
  'Abdomen', 'Hips', 'Legs', 'Feet', 'Other',
];

export const WORKOUT_TYPES = [
  'Running', 'Walking', 'Yoga', 'Gym', 'Cycling',
  'Swimming', 'Dance', 'Pilates', 'HIIT', 'Other',
];

export interface WellnessEntry {
  id?: number;
  date: string;                    // YYYY-MM-DD

  mood_score: MoodScore | null;
  energy_level: number | null;     // 1-5
  stress_level: number | null;     // 1-5

  sleep_hours: number | null;
  sleep_quality: number | null;    // 1-5

  food_quality: FoodQuality | null;
  food_notes: string | null;

  workout: boolean;
  workout_type: string[];
  workout_duration_min: number | null;

  has_pain: boolean;
  pain_locations: string[];
  pain_level: number | null;       // 1-10
  pain_notes: string | null;

  partner_rating: number | null;   // 1-5

  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WellnessSummary {
  total_entries: number;
  avg_mood: number | null;
  avg_energy: number | null;
  avg_stress: number | null;
  avg_sleep_hours: number | null;
  avg_sleep_quality: number | null;
  workout_days_count: number;
  pain_days_count: number;
  top_pain_locations: string[];
  pain_location_counts: Record<string, number>;
  workout_type_counts: Record<string, number>;
  avg_mood_workout_days: number | null;
  avg_mood_no_workout: number | null;
  food_mood_avg: Record<string, number>;
}

export interface WellnessStats {
  entries: WellnessEntry[];
  summary: WellnessSummary;
}
