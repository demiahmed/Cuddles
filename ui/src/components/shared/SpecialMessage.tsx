import { PeriodStats } from '@/types';
import { useState, useEffect } from 'react';
import { fetchData } from '@/utils/api';

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

    // Fetch special message from API
    const fetchSpecialMessage = async () => {
      try {
        const response = await fetchData<{message: string | null, type: string}>('/api/special-message');
        if (response.message) {
          setMessage(response.message);
        } else {
          setMessage('');
        }
      } catch (error) {
        console.error('Error fetching special message:', error);
        setMessage('');
      }
    };

    fetchSpecialMessage();
  }, [periodStats]);

  if (!message) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="rounded-2xl border-2 border-pink-200 bg-pink-50 px-5 py-4 text-center">
        <p
          className="text-base font-semibold text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>
    </div>
  );
}