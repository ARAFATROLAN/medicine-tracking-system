import React, { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  format = (val) => String(val),
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    const target = Math.max(0, value);
    const frames = Math.max(1, Math.round(duration / 16));
    const increment = target / frames;
    let current = 0;
    let frame = 0;
    let rafId: number;

    const step = () => {
      frame += 1;
      current += increment;

      if (frame >= frames) {
        setDisplayValue(target);
        return;
      }

      setDisplayValue(Math.round(current));
      rafId = window.requestAnimationFrame(step);
    };

    setDisplayValue(0);
    rafId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return <>{format(displayValue)}</>;
};

export default AnimatedNumber;
