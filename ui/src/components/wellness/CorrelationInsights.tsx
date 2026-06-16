'use client';

import { WellnessSummary, WellnessEntry } from '@/types/wellness';

interface Props {
  summary: WellnessSummary;
  entries: WellnessEntry[];
}

function StatCard({
  label, value, sub, color = 'pink',
}: {
  label: string; value: string | number | null; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    pink: 'bg-pink-50 border-pink-100',
    amber: 'bg-amber-50 border-amber-100',
    violet: 'bg-violet-50 border-violet-100',
    indigo: 'bg-indigo-50 border-indigo-100',
    green: 'bg-green-50 border-green-100',
    red: 'bg-red-50 border-red-100',
    cyan: 'bg-cyan-50 border-cyan-100',
  };
  const textMap: Record<string, string> = {
    pink: 'text-pink-600', amber: 'text-amber-600', violet: 'text-violet-600',
    indigo: 'text-indigo-600', green: 'text-green-600', red: 'text-red-600', cyan: 'text-cyan-600',
  };

  return (
    <div className={`rounded-xl border p-3 ${colorMap[color] ?? colorMap.pink}`}>
      <p className="text-[11px] font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textMap[color] ?? textMap.pink}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function moodLabel(n: number | null) {
  if (!n) return null;
  const m: Record<number, string> = { 1: 'Awful', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Amazing' };
  return `${n} · ${m[Math.round(n)] ?? ''}`;
}

function PainBar({ location, count, max }: { location: string; count: number; max: number }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-600 shrink-0 capitalize">{location}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-red-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 w-6 text-right">{count}</span>
    </div>
  );
}

export default function CorrelationInsights({ summary, entries }: Props) {
  const {
    total_entries, avg_mood, avg_energy, avg_stress,
    avg_sleep_hours, avg_sleep_quality,
    workout_days_count, pain_days_count,
    pain_location_counts, workout_type_counts,
    avg_mood_workout_days, avg_mood_no_workout, food_mood_avg,
  } = summary;

  const workoutDelta =
    avg_mood_workout_days !== null && avg_mood_no_workout !== null
      ? +(avg_mood_workout_days - avg_mood_no_workout).toFixed(1)
      : null;

  const bestFoodMood = Object.entries(food_mood_avg).sort(([, a], [, b]) => b - a)[0];

  const maxPain = Math.max(1, ...Object.values(pain_location_counts));
  const painEntries = Object.entries(pain_location_counts).sort(([, a], [, b]) => b - a);

  const topWorkout = Object.entries(workout_type_counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const daysRange = entries.length > 0
    ? `${entries.length} days tracked`
    : '';

  return (
    <div className="space-y-5">

      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Avg Mood" value={moodLabel(avg_mood)} sub={daysRange} color="pink" />
        <StatCard label="Avg Energy" value={avg_energy !== null ? `${avg_energy} / 5` : null} color="amber" />
        <StatCard label="Avg Stress" value={avg_stress !== null ? `${avg_stress} / 5` : null} color="violet" />
        <StatCard label="Avg Sleep" value={avg_sleep_hours !== null ? `${avg_sleep_hours}h` : null} sub={avg_sleep_quality !== null ? `Quality: ${avg_sleep_quality}/5` : undefined} color="indigo" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Workout Days" value={workout_days_count} sub={total_entries > 0 ? `${Math.round((workout_days_count / total_entries) * 100)}% of logged days` : undefined} color="green" />
        <StatCard label="Pain Days" value={pain_days_count} sub={total_entries > 0 ? `${Math.round((pain_days_count / total_entries) * 100)}% of logged days` : undefined} color="red" />
      </div>

      {/* Workout mood lift */}
      {workoutDelta !== null && (
        <div className={`rounded-xl border p-4 ${workoutDelta >= 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
          <p className="text-xs font-semibold text-gray-600 mb-1">💪 Workout effect on mood</p>
          <p className="text-sm text-gray-700">
            On days you exercise, your mood averages{' '}
            <span className={`font-bold ${workoutDelta >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {workoutDelta >= 0 ? '+' : ''}{workoutDelta} pts
            </span>{' '}
            higher ({avg_mood_workout_days} vs {avg_mood_no_workout} without).
          </p>
        </div>
      )}

      {/* Best food for mood */}
      {bestFoodMood && (
        <div className="rounded-xl border bg-amber-50 border-amber-100 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-1">🍽️ Food & mood</p>
          <p className="text-sm text-gray-700">
            Your mood is highest after{' '}
            <span className="font-bold text-amber-600 capitalize">{bestFoodMood[0]}</span>{' '}
            food days (avg {bestFoodMood[1]}/5).
          </p>
          {Object.entries(food_mood_avg).length > 1 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(food_mood_avg)
                .sort(([, a], [, b]) => b - a)
                .map(([q, m]) => (
                  <span key={q} className="text-xs text-gray-500 capitalize">
                    {q}: <span className="font-semibold text-gray-700">{m}</span>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Pain locations */}
      {painEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">🩺 Pain frequency by location</p>
          <div className="space-y-1.5">
            {painEntries.slice(0, 6).map(([loc, count]) => (
              <PainBar key={loc} location={loc} count={count} max={maxPain} />
            ))}
          </div>
        </div>
      )}

      {/* Top workout types */}
      {topWorkout.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">🏅 Favourite activities</p>
          <div className="flex flex-wrap gap-2">
            {topWorkout.map(([type, count]) => (
              <span key={type} className="px-3 py-1 bg-pink-50 border border-pink-100 rounded-full text-xs text-pink-700 font-medium">
                {type} <span className="text-pink-400">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
