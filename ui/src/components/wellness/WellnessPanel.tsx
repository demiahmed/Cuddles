'use client';

import { useState, useEffect, useCallback } from 'react';
import { WellnessEntry, WellnessStats, MOOD_EMOJI, MOOD_LABELS, MoodScore } from '@/types/wellness';
import { fetchWellnessStats, fetchWellnessToday } from '@/utils/wellness';
import WellnessForm from '@/components/wellness/WellnessForm';
import MoodVitalsChart from '@/components/wellness/MoodVitalsChart';
import SleepChart from '@/components/wellness/SleepChart';
import CorrelationInsights from '@/components/wellness/CorrelationInsights';

interface Props {
  onWellnessSaved?: () => void;
  initialDate?: string | null;
  initialEntry?: WellnessEntry | null;
  onBack?: () => void;
}

function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default function WellnessPanel({ onWellnessSaved, initialDate, initialEntry, onBack }: Props) {
  const [stats, setStats] = useState<WellnessStats | null>(null);
  const [todayEntry, setTodayEntry] = useState<WellnessEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!initialDate);
  const [formDate, setFormDate] = useState<string>(initialDate ?? todayStr());
  const [savedFromCalendar, setSavedFromCalendar] = useState(false);
  const [activeSection, setActiveSection] = useState<'mood' | 'sleep' | 'insights'>('mood');

  const reload = useCallback(async () => {
    setLoading(true);
    const [s, t] = await Promise.all([fetchWellnessStats(60), fetchWellnessToday()]);
    setStats(s);
    setTodayEntry(t);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // When initialDate changes (e.g. user opened a second calendar date), reset
  useEffect(() => {
    if (initialDate) {
      setFormDate(initialDate);
      setShowForm(true);
      setSavedFromCalendar(false);
    }
  }, [initialDate]);

  const entryForFormDate = stats?.entries.find(e => e.date === formDate) ?? initialEntry ?? null;
  const isCalendarMode = !!initialDate;

  function handleSaved(entry: WellnessEntry) {
    setShowForm(false);
    if (entry.date === todayStr()) setTodayEntry(entry);
    reload();
    onWellnessSaved?.();
    if (isCalendarMode) setSavedFromCalendar(true);
  }

  const today = todayStr();
  const moodScore = todayEntry?.mood_score as MoodScore | null | undefined;

  // ── Post-save screen (came from calendar) ────────────────────────────────
  if (savedFromCalendar) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-6">
        <div className="text-5xl">✅</div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">Wellness log saved!</p>
          <p className="text-sm text-gray-500 mt-1">{formatDisplayDate(formDate)}</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Back to Calendar
          </button>
          <button
            onClick={() => {
              setSavedFromCalendar(false);
              setFormDate(today);
            }}
            className="flex-1 py-3 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors shadow-sm"
          >
            Stay in Wellness
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Calendar-mode header */}
      {isCalendarMode && (
        <div className="flex items-center gap-3 pb-1 border-b border-gray-100">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Calendar
          </button>
          <span className="text-sm font-semibold text-gray-700">
            Wellness log — {formatDisplayDate(formDate)}
          </span>
        </div>
      )}

      {/* Today's log card (only when not in calendar mode) */}
      {!isCalendarMode && (
        <div className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 transition-colors ${
          todayEntry
            ? 'bg-pink-50 border-pink-200'
            : 'bg-gray-50 border-dashed border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            {todayEntry && moodScore ? (
              <>
                <span className="text-3xl">{MOOD_EMOJI[moodScore]}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Today feels {MOOD_LABELS[moodScore]}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {todayEntry.energy_level && (
                      <span className="text-xs text-gray-500">⚡ Energy {todayEntry.energy_level}/5</span>
                    )}
                    {todayEntry.sleep_hours && (
                      <span className="text-xs text-gray-500">🌙 {todayEntry.sleep_hours}h sleep</span>
                    )}
                    {todayEntry.workout && (
                      <span className="text-xs text-gray-500">🏃 Worked out</span>
                    )}
                    {todayEntry.has_pain && (
                      <span className="text-xs text-red-400">🩺 Pain noted</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-3xl">📓</span>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">No log for today</p>
                  <p className="text-xs text-gray-400">Takes less than 60 seconds</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => { setFormDate(today); setShowForm(true); }}
            className="shrink-0 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-colors shadow-sm"
          >
            {todayEntry ? 'Edit' : 'Log Today'}
          </button>
        </div>
      )}

      {/* Section tabs (hidden in calendar mode until after form dismissal) */}
      {!isCalendarMode && (
        <>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['mood', 'sleep', 'insights'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeSection === s
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'mood' ? '😊 Mood & Vitals' : s === 'sleep' ? '🌙 Sleep' : '✨ Insights'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <>
              {activeSection === 'mood' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Last 60 days — mood (1-5), energy & stress</p>
                  <MoodVitalsChart entries={stats?.entries ?? []} />
                </div>
              )}
              {activeSection === 'sleep' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Sleep hours & quality over time</p>
                  <SleepChart entries={stats?.entries ?? []} />
                </div>
              )}
              {activeSection === 'insights' && stats && (
                <CorrelationInsights summary={stats.summary} entries={stats.entries} />
              )}
              {activeSection === 'insights' && !stats && (
                <div className="text-center text-gray-400 text-sm py-10">
                  Log a few days to unlock insights.
                </div>
              )}
            </>
          )}

          {/* Past log quick-access */}
          {stats && stats.entries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent logs</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...stats.entries].reverse().slice(0, 14).map((e) => {
                  const ms = e.mood_score as MoodScore | null;
                  return (
                    <div
                      key={e.date}
                      className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setFormDate(e.date); setShowForm(true); }}
                    >
                      <span className="w-20 text-gray-400 shrink-0">
                        {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-base">{ms ? MOOD_EMOJI[ms] : '·'}</span>
                      <span className="text-gray-500 truncate">
                        {[
                          e.workout ? '🏃' : null,
                          e.has_pain ? '🩺' : null,
                          e.sleep_hours ? `${e.sleep_hours}h` : null,
                          e.food_quality ?? null,
                        ].filter(Boolean).join(' · ') || 'logged'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <WellnessForm
          date={formDate}
          existing={formDate === today ? (todayEntry ?? initialEntry ?? null) : entryForFormDate}
          onClose={() => {
            setShowForm(false);
            if (isCalendarMode) onBack?.();
          }}
          onSaved={handleSaved}
          onDeleted={() => {
            setShowForm(false);
            if (formDate === today) setTodayEntry(null);
            reload();
            onWellnessSaved?.();
            if (isCalendarMode) onBack?.();
          }}
        />
      )}
    </div>
  );
}
