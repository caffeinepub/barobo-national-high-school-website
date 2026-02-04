import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function PhilippineTimeClock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format as single sentence: "Philippine Standard Time: Tuesday, January 13, 2026 at 05:14:38 AM, GMT +8"
  const formatPSTSentence = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'Asia/Manila',
    });
    
    const fullDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Manila',
    });
    
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    });

    return `Philippine Standard Time: ${dayName}, ${fullDate} at ${time}, GMT +8`;
  };

  return (
    <div>
      <p className="text-sm md:text-base font-medium text-school-maroon flex items-center justify-center md:justify-start gap-2">
        <Clock className="h-4 w-4 md:h-5 md:w-5 text-school-gold" />
        <span>{formatPSTSentence(currentTime)}</span>
      </p>
    </div>
  );
}
