import { useEffect, useState } from 'react';
import { isCancellationClosed, nextCancellationClockChange, vietnamToday } from '../utils/cancellationDeadline';

export function useCancellationDeadline(date?: string) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    // Update at 08:00 and midnight without continuously re-rendering the meal list.
    const timer = setTimeout(() => setNow(Date.now()), Math.max(1, nextCancellationClockChange(now) - Date.now() + 1));
    return () => clearTimeout(timer);
  }, [now]);
  return { closed: isCancellationClosed(date, now), today: vietnamToday(now), now };
}
