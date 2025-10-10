import { Entry } from '../types';

export async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

interface RawEntry {
  id: number;
  datetime: string;
  type: EntryType;
  flow: FlowLevel | null;
  protected: Protection | null;
  time_of_day: string | null;
  satisfaction: string | null;
  symptoms: string[];
  pain: number | null;
  mood: string | null;
  lube: boolean | null;
  notes: string | null;
}

export async function loadData(year: number, month: number): Promise<Entry[]> {
  try {
    const response = await fetch(
      `/api/entries?year=${year}&month=${month + 1}`
    );
    if (!response.ok)
      throw new Error(
        `Failed to fetch entries: ${response.status} ${response.statusText}`
      );
    const data = await response.json() as RawEntry[];
    return data
      .sort((a, b) => {
        const partsA = a.datetime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        const partsB = b.datetime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        const dateA = partsA
          ? new Date(
              parseInt(partsA[1]),    // year
              parseInt(partsA[2]) - 1, // month (0-based)
              parseInt(partsA[3]),    // day
              parseInt(partsA[4]),    // hour
              parseInt(partsA[5]),    // minute
              parseInt(partsA[6])     // second
            )
          : new Date(0);
        const dateB = partsB
          ? new Date(
              parseInt(partsB[1]),    // year
              parseInt(partsB[2]) - 1, // month (0-based)
              parseInt(partsB[3]),    // day
              parseInt(partsB[4]),    // hour
              parseInt(partsB[5]),    // minute
              parseInt(partsB[6])     // second
            )
          : new Date(0);
        return dateA.getTime() - dateB.getTime();
      })
      .map((entry: RawEntry) => {
        const parts = entry.datetime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        const dateStr = parts
          ? `${parts[1]}-${parts[2]}-${parts[3]}`
          : '1970-01-01';
          
        const baseEntry = {
          id: entry.id,
          date: dateStr,
          datetime: entry.datetime,
          entry_type: entry.type,
          time_of_day: entry.time_of_day || null,
          notes: entry.notes || null,
          mood: entry.mood || null,
        };

        if (entry.type === 'period_start' || entry.type === 'period_end') {
          return {
            ...baseEntry,
            flow: entry.flow || null,
            pain: entry.pain || null,
            symptoms: entry.symptoms || [],
          } as Entry;
        } else {
          return {
            ...baseEntry,
            protected: entry.protected || null,
            satisfaction: entry.satisfaction 
              ? parseInt(entry.satisfaction) 
              : null,
            lube: entry.lube || null,
          } as Entry;
        }
      });
  } catch (err) {
    console.error("Error loading data:", err instanceof Error ? err.message : err);
    return [];
  }
}

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type Protection = 'protected' | 'unprotected';
export type EntryType = 'period_start' | 'period_end' | 'sex';

export interface BaseEntryPayload {
  datetime?: string;
  date: string;
  time_of_day?: string | null;
  notes?: string | null;
  mood?: string | null;
}

export interface PeriodEntry extends BaseEntryPayload {
  entry_type: 'period_start' | 'period_end';
  flow: FlowLevel | null;
  pain?: number | null;
  symptoms?: string[];
}

export interface SexEntry extends BaseEntryPayload {
  entry_type: 'sex';
  protected?: Protection | null;
  satisfaction?: number | null;
  lube?: boolean | null;
}

export type SaveEntryPayload = PeriodEntry | SexEntry;

export type EntryResponse = SaveEntryPayload & { id: number };

export async function saveEntry(entry: SaveEntryPayload & { id?: number }): Promise<{ success: boolean; data?: EntryResponse; error?: string }> {
  const { id, date, entry_type, ...rest } = entry;
  const payload = {
    datetime: `${date}T${rest.time_of_day || '00:00:00'}`,
    entry_type,
    ...rest,
  };

  const url = id
    ? `/api/entries/${entry_type}/${id}`
    : `/api/entries`;
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save entry: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function deleteEntry(entryType: EntryType, id: string): Promise<{ success: boolean; error?: string }> {
  console.log(`Deleting entry - Type: ${entryType}, ID: ${id}`);
  const url = `/api/entries/${entryType}/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `Failed to delete entry: ${response.status} ${response.statusText}`;
      console.error(`Delete failed - Status: ${response.status}, Error:`, errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Entry deleted successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface PeriodStats {
  cycle_lengths: Array<{
    start: string;
    length_days: number;
  }>;
  durations: Array<{
    start: string;
    duration_days: number;
  }>;
  avg_cycle: number | null;
  predicted_next: string | null;
}

export async function loadPeriodStats(): Promise<PeriodStats> {
  try {
    const response = await fetch(`/api/stats/periods`);
    if (!response.ok)
      throw new Error(
        `Failed to fetch period stats: ${response.status} ${response.statusText}`
      );
    return await response.json();
  } catch (err) {
    console.error("Error loading period stats:", err instanceof Error ? err.message : err);
    return {
      cycle_lengths: [],
      durations: [],
      avg_cycle: null,
      predicted_next: null,
    };
  }
}

export interface SexStats {
  total: number;
  longest_with: number;
  longest_without: number;
  days_since_last: string;
  avg_gap_days: number;
  entries_per_week: number;
  entries_per_month: number;
  avg_satisfaction: number | null;
  most_common_time: string | null;
  list: SaveEntryPayload[];
  current_month_count?: number;
}

export async function loadSexStats(): Promise<SexStats> {
  try {
    const response = await fetch(`/api/stats/sex`);
    if (!response.ok)
      throw new Error(
        `Failed to fetch sex stats: ${response.status} ${response.statusText}`
      );
    return await response.json();
  } catch (err) {
    console.error("Error loading sex stats:", err instanceof Error ? err.message : err);
    return {
      total: 0,
      longest_with: 0,
      longest_without: 0,
      days_since_last: "N/A",
      avg_gap_days: 0,
      entries_per_week: 0,
      entries_per_month: 0,
      avg_satisfaction: null,
      most_common_time: null,
      list: [],
    };
  }
}