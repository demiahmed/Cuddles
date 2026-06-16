'use client';

import { useState, useEffect } from 'react';
import {
  WellnessEntry, MoodScore, FoodQuality,
  MOOD_LABELS, MOOD_EMOJI, PAIN_LOCATIONS, WORKOUT_TYPES,
} from '@/types/wellness';
import { saveWellnessEntry } from '@/utils/wellness';

interface Props {
  date: string;
  existing?: WellnessEntry | null;
  onClose: () => void;
  onSaved: (entry: WellnessEntry) => void;
}

const SCALE5 = [1, 2, 3, 4, 5] as const;

const ENERGY_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const STRESS_LABELS = ['Very Calm', 'Relaxed', 'Moderate', 'Stressed', 'Very Stressed'];
const SLEEP_Q_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Great'];
const FOOD_OPTIONS: { value: FoodQuality; label: string; emoji: string }[] = [
  { value: 'poor', label: 'Poor', emoji: '🍟' },
  { value: 'fair', label: 'Fair', emoji: '🥪' },
  { value: 'good', label: 'Good', emoji: '🥗' },
  { value: 'excellent', label: 'Excellent', emoji: '🥦' },
];

function ScaleRow({
  value, onChange, labels, activeColor,
}: {
  value: number | null;
  onChange: (v: number) => void;
  labels: string[];
  activeColor: string;
}) {
  return (
    <div className="flex gap-2">
      {SCALE5.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
            value === n
              ? `${activeColor} text-white border-transparent shadow`
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {n}
          <div className="text-[10px] font-normal leading-tight mt-0.5 hidden sm:block">
            {labels[n - 1]}
          </div>
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

export default function WellnessForm({ date, existing, onClose, onSaved }: Props) {
  const [mood, setMood] = useState<MoodScore | null>(existing?.mood_score ?? null);
  const [energy, setEnergy] = useState<number | null>(existing?.energy_level ?? null);
  const [stress, setStress] = useState<number | null>(existing?.stress_level ?? null);
  const [sleepHours, setSleepHours] = useState<number | null>(existing?.sleep_hours ?? null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(existing?.sleep_quality ?? null);
  const [foodQuality, setFoodQuality] = useState<FoodQuality | null>(existing?.food_quality ?? null);
  const [foodNotes, setFoodNotes] = useState(existing?.food_notes ?? '');
  const [workout, setWorkout] = useState(existing?.workout ?? false);
  const [workoutTypes, setWorkoutTypes] = useState<string[]>(existing?.workout_type ?? []);
  const [workoutDuration, setWorkoutDuration] = useState<number | null>(existing?.workout_duration_min ?? null);
  const [hasPain, setHasPain] = useState(existing?.has_pain ?? false);
  const [painLocations, setPainLocations] = useState<string[]>(existing?.pain_locations ?? []);
  const [painLevel, setPainLevel] = useState<number | null>(existing?.pain_level ?? null);
  const [painNotes, setPainNotes] = useState(existing?.pain_notes ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function toggleChip(arr: string[], val: string, set: (a: string[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  async function handleSave() {
    setSaving(true);
    const result = await saveWellnessEntry({
      date,
      mood_score: mood,
      energy_level: energy,
      stress_level: stress,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      food_quality: foodQuality,
      food_notes: foodNotes || null,
      workout,
      workout_type: workoutTypes,
      workout_duration_min: workoutDuration,
      has_pain: hasPain,
      pain_locations: painLocations,
      pain_level: painLevel,
      pain_notes: painNotes || null,
      notes: notes || null,
    });
    setSaving(false);
    if (result) onSaved(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Daily Wellness Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

          {/* ── Mood ── */}
          <section>
            <SectionTitle>How are you feeling? 💭</SectionTitle>
            <div className="flex gap-2 justify-between">
              {(SCALE5 as unknown as MoodScore[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMood(n)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                    mood === n
                      ? 'border-pink-500 bg-pink-50 shadow'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  <span className="text-xl">{MOOD_EMOJI[n]}</span>
                  <span className="text-[10px] text-gray-600 mt-0.5">{MOOD_LABELS[n]}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Energy & Stress ── */}
          <section>
            <SectionTitle>Energy & Stress ⚡</SectionTitle>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Energy level</p>
                <ScaleRow value={energy} onChange={setEnergy} labels={ENERGY_LABELS} activeColor="bg-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Stress level</p>
                <ScaleRow value={stress} onChange={setStress} labels={STRESS_LABELS} activeColor="bg-violet-500" />
              </div>
            </div>
          </section>

          {/* ── Sleep ── */}
          <section>
            <SectionTitle>Sleep 🌙</SectionTitle>
            <div className="flex gap-4 items-end mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1.5">Hours slept</p>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSleepHours((h) => Math.max(0, (h ?? 7) - 0.5))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-lg"
                  >−</button>
                  <span className="flex-1 text-center font-semibold text-gray-800">
                    {sleepHours !== null ? sleepHours : '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSleepHours((h) => Math.min(24, (h ?? 7) + 0.5))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 text-lg"
                  >+</button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1.5">Sleep quality</p>
            <ScaleRow value={sleepQuality} onChange={setSleepQuality} labels={SLEEP_Q_LABELS} activeColor="bg-indigo-500" />
          </section>

          {/* ── Food ── */}
          <section>
            <SectionTitle>Food & Nutrition 🍽️</SectionTitle>
            <div className="flex gap-2 mb-3">
              {FOOD_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFoodQuality(value)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 transition-all ${
                    foodQuality === value
                      ? 'border-green-500 bg-green-50 shadow'
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-[10px] text-gray-600 mt-0.5">{label}</span>
                </button>
              ))}
            </div>
            <textarea
              placeholder="What did you eat? (optional)"
              value={foodNotes}
              onChange={(e) => setFoodNotes(e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </section>

          {/* ── Workout ── */}
          <section>
            <SectionTitle>Movement & Activity 🏃</SectionTitle>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => setWorkout(!workout)}
                className={`relative w-10 h-6 rounded-full transition-colors ${workout ? 'bg-pink-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${workout ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-gray-700">Worked out today</span>
            </div>
            {workout && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Type of activity</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WORKOUT_TYPES.map((wt) => (
                      <button
                        key={wt}
                        type="button"
                        onClick={() => toggleChip(workoutTypes, wt, setWorkoutTypes)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          workoutTypes.includes(wt)
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        {wt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 shrink-0">Duration (min)</p>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    step={5}
                    value={workoutDuration ?? ''}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value) || null)}
                    placeholder="e.g. 45"
                    className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
            )}
          </section>

          {/* ── Pain ── */}
          <section>
            <SectionTitle>Pain & Discomfort 🩺</SectionTitle>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => setHasPain(!hasPain)}
                className={`relative w-10 h-6 rounded-full transition-colors ${hasPain ? 'bg-pink-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasPain ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-gray-700">Experiencing pain</span>
            </div>
            {hasPain && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Where? (select all that apply)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PAIN_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleChip(painLocations, loc, setPainLocations)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          painLocations.includes(loc)
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Pain intensity</p>
                    <span className="text-xs font-bold text-red-500">{painLevel ?? '—'} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={painLevel ?? 1}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
                <textarea
                  placeholder="Any notes about the pain? (optional)"
                  value={painNotes}
                  onChange={(e) => setPainNotes(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            )}
          </section>

          {/* ── Journal ── */}
          <section>
            <SectionTitle>Journal 📝</SectionTitle>
            <textarea
              placeholder="Anything else on your mind today? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-2 py-2.5 px-6 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
