import { WellnessEntry, WellnessStats } from '@/types/wellness';

export async function fetchWellnessMonth(year: number, month: number): Promise<WellnessEntry[]> {
  try {
    const res = await fetch(`/api/wellness?year=${year}&month=${month}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchWellnessToday(): Promise<WellnessEntry | null> {
  try {
    const res = await fetch('/api/wellness/today');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchWellnessByDate(date: string): Promise<WellnessEntry | null> {
  try {
    const res = await fetch(`/api/wellness/${date}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function saveWellnessEntry(
  entry: Partial<WellnessEntry> & { date: string }
): Promise<WellnessEntry | null> {
  try {
    const res = await fetch('/api/wellness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteWellnessEntry(date: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/wellness/${date}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchWellnessStats(days = 60): Promise<WellnessStats | null> {
  try {
    const res = await fetch(`/api/wellness/stats?days=${days}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
