export type EntryType = 'period_start' | 'period_end' | 'sex';

export type FlowType = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type ProtectionType = 'protected' | 'unprotected' | null;

export interface Entry {
  id?: number;
  date: string;
  datetime: string;
  entry_type: EntryType;
  flow?: FlowType | null;
  protected?: ProtectionType;
  time_of_day?: string | null;
  satisfaction?: number | null;
  symptoms?: string[];
  pain?: number | null;
  mood?: string | null;
  lube?: boolean | null;
  notes?: string | null;
}

export interface PeriodStats {
  cycle_lengths: { start: string; length_days: number }[];
  durations: { start: string; duration_days: number }[];
  avg_cycle: number | null;
  predicted_next: string | null;
  ovulation_window?: [string, string] | null;
}

export interface SexStats {
  total: number;
  current_month_count: number;
  longest_with: number;
  longest_with_period?: string | null;
  longest_without: number;
  longest_without_period?: string | null;
  days_since_last: string;
  avg_gap_days: number;
  entries_per_week: number;
  entries_per_month: number;
  avg_satisfaction: number | string;
  most_common_time: string;
  list: Entry[];
}

export interface MonthlyEntry {
  month: string;
  count: number;
  month_key: string;
}

export interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
  missing: number;
}