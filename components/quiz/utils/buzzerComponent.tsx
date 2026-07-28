import { useEffect, useState } from 'react';
import { generateBuzzerQRCode } from '../utils/generateBuzzerQRCode';

export function BuzzerComponent({ isVisible }: { isVisible: boolean }) {
  const fadeDurationMs = 220;
  const fadeInDelayMs = 16;
  const [shouldRender, setShouldRender] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timeoutId = window.setTimeout(() => {
        setIsShown(true);
      }, fadeInDelayMs);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    setIsShown(false);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, fadeDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fadeDurationMs, fadeInDelayMs, isVisible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`buzzer-overlay flex-col absolute right-20 bottom-20 z-50 flex h-fit w-fit max-w-[calc(100vw-3rem)] items-center justify-center rounded-4xl px-10 py-10 text-left text-white shadow-2xl ${
        isShown ? 'buzzer-overlay-visible' : 'buzzer-overlay-hidden'
      }`}
    >
      <h1 className="mb-10 text-5xl font-semibold tracking-tight">Team & Buzzer:</h1>
      <section className="ui-panel px-6 py-6 text-slate-900">
        <div>
          {generateBuzzerQRCode(500)}
        </div>
      </section>
      <h1 className="mt-8 text-3xl tracking-tight">1 Handy pro Team</h1>
    </div>
  );
}