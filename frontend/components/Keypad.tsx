"use client";

const KEYS: Array<{ digit: string; letters?: string } | "blank" | "backspace"> = [
  { digit: "1" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  "blank",
  { digit: "0" },
  "backspace",
];

type KeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
};

export default function Keypad({ onDigit, onBackspace }: KeypadProps) {
  return (
    <div className="shrink-0 rounded-t-[22px] bg-[#e9eaec] px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5">
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key, index) => {
          if (key === "blank") {
            return <div key={`blank-${index}`} aria-hidden="true" />;
          }

          if (key === "backspace") {
            return (
              <button
                key="backspace"
                type="button"
                aria-label="Delete digit"
                onClick={onBackspace}
                className="key text-ink"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <path
                    d="M8.2 1h12.3A2.5 2.5 0 0 1 23 3.5v11a2.5 2.5 0 0 1-2.5 2.5H8.2a2 2 0 0 1-1.5-.7L1 9l5.7-7.3A2 2 0 0 1 8.2 1Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m11.5 6.2 5.5 5.6m0-5.6-5.5 5.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            );
          }

          return (
            <button
              key={key.digit}
              type="button"
              onClick={() => onDigit(key.digit)}
              className="key"
            >
              <span className="text-[22px] font-normal leading-none text-ink">{key.digit}</span>
              {key.letters ? (
                <span className="mt-0.5 text-[9px] font-medium tracking-[0.12em] text-neutral-500">
                  {key.letters}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
