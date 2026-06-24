import { useState, useEffect } from 'react';


export function parseStats(raw) {
  if (!raw || typeof raw !== 'string') {
    return { numeric: 0, unit: '', suffix: raw || '', raw };
  }


  const match = raw.match(/^(\d+(?:\.\d+)?)([A-Za-z]*)(\+?)\s*(.*)$/);
  if (!match) {
    return { numeric: 0, unit: '', suffix: raw, raw };
  }

  const numeric = parseFloat(match[1]);
  const letterUnit = match[2];
  const plusSign = match[3];
  const suffix = match[4].trim();

  const unit = letterUnit + plusSign;

  if (isNaN(numeric)) {
    return { numeric: 0, unit: '', suffix: raw, raw };
  }

  return { numeric, unit, suffix, raw };
}


export default function StatsCountUp({ value, counted, reduced }) {
  const parsed = parseStats(value);
  const parseFailed = parsed.numeric === 0 && parsed.unit === '' && parsed.suffix === value;

  const [display, setDisplay] = useState(
    (reduced || parseFailed) ? parsed.numeric : 0
  );

  useEffect(() => {
    if (reduced || parseFailed) {
      setDisplay(parsed.numeric);
      return;
    }

    if (!counted) return;

    const duration = 800;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * parsed.numeric));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [counted]);

  if (parseFailed) {
    return <>{value}</>;
  }

  return (
    <>
      {display}{parsed.unit}{parsed.suffix ? ` ${parsed.suffix}` : ''}
    </>
  );
}
