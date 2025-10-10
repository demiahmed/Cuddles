import { PeriodStats } from '@/types';
import { useState, useEffect } from 'react';

const periodSoonMessages = (diffDays: number) => [
  `🌸 Your next period is in <strong>${diffDays} day${
    diffDays > 1 ? 's' : ''
  }</strong> — stock up on chocolate 🍫`,
  `⏳ Tick-tock… <strong>${diffDays} day${
    diffDays > 1 ? 's' : ''
  }</strong> until period time — you got this 💪`,
  `💖 Heads up! Only <strong>${diffDays} day${
    diffDays > 1 ? 's' : ''
  }</strong> left before your flow arrives 🌊`,
  `🩸 Aunt Jaibu's packing her bags… ETA: <strong>${diffDays} day${
    diffDays > 1 ? 's' : ''
  }</strong> 😉`,
  `🌹 Period incoming in <strong>${diffDays} day${
    diffDays > 1 ? 's' : ''
  }</strong> — be kind to yourself 💕`,
];

const fertileMessages = [
  `🔥 Looks like you're in the <strong>fertile zone</strong> — high chance of baby magic if you don't behave 😉`,
  `💋 The stars say it's your <strong>wild window</strong> — fun now could mean little feet later 👶`,
  `🌶️ Fertility's peaking! A little playtime now could turn into a whole new adventure 😏`,
  `💃 Your body's screaming <strong>yes</strong> — stay naughty, but careful 😉`,
  `⚡ You're basically a <strong>pregnancy powerhouse</strong> right now — handle with caution 😜`,
  `🩸 Aunt Jaibu's packing her bags… 😉 Your ovaries are on VIP mode — fertile and ready! 💃✨`,
];

interface SpecialMessageProps {
  periodStats: PeriodStats | null;
}

export default function SpecialMessage({ periodStats }: SpecialMessageProps) {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!periodStats?.predicted_next || !periodStats.avg_cycle) {
      setMessage('');
      return;
    }

    const today = new Date();
    const nextPeriod = new Date(periodStats.predicted_next);
    const diffDays = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      setMessage('');
    } else if (diffDays >= 0 && diffDays <= 4) {
      const ovulationDay = new Date(nextPeriod);
      ovulationDay.setDate(nextPeriod.getDate() - 14);

      const diffFromOvulation = Math.ceil(
        (ovulationDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffFromOvulation >= 0 && diffFromOvulation <= 4) {
        const randomMsg = fertileMessages[Math.floor(Math.random() * fertileMessages.length)];
        setMessage(randomMsg);
      } else if (diffDays > 0 && diffDays <= 5) {
        const options = periodSoonMessages(diffDays);
        setMessage(options[Math.floor(Math.random() * options.length)]);
      } else {
        setMessage(`Your period is in ${diffDays} days.`);
      }
    }
  }, [periodStats]);

  if (!message) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 shadow-md text-center">
        <p
          className="text-lg font-semibold text-pink-700"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>
    </div>
  );
}