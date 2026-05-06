"use client";

import Link from "next/link";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import s from "./PlayShell.module.css";

type PlayShellProps = {
  dayNumber: number;
  category: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  explainer: ReactNode;
  prevDay?: number;
  nextDay?: number;
};

type PlayShellContextValue = {
  setExplainer: (explainer: ReactNode) => void;
};

const PlayShellContext = createContext<PlayShellContextValue>({
  setExplainer: () => undefined
});

// The shell owns explainer state so route pages stay server-rendered and statically generated,
// while client games can still update the shared "what just happened" panel after interaction.
export function usePlayShell() {
  return useContext(PlayShellContext);
}

function formatDay(dayNumber: number) {
  return String(dayNumber).padStart(2, "0");
}

function dayHref(dayNumber: number) {
  return `/play/${formatDay(dayNumber)}`;
}

export default function PlayShell({
  dayNumber,
  category,
  title,
  subtitle,
  children,
  explainer,
  prevDay,
  nextDay
}: PlayShellProps) {
  const [currentExplainer, setCurrentExplainer] = useState<ReactNode | null>(null);
  const contextValue = useMemo(
    () => ({ setExplainer: setCurrentExplainer }),
    []
  );

  return (
    <PlayShellContext.Provider value={contextValue}>
      <main className={s.shell}>
        <div className={`${s.corner} ${s.cornerLeft}`} aria-hidden="true" />
        <div className={`${s.corner} ${s.cornerRight}`} aria-hidden="true" />

        <div className={s.container}>
          <p className={s.eyebrow}>◦ DAY {formatDay(dayNumber)} — {category}</p>

          <header className={s.header}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <span aria-hidden="true" />
          </header>

          <section className={s.gameSlot}>{children}</section>

          <section className={s.explainer} aria-label="What just happened">
            <h2>WHAT JUST HAPPENED</h2>
            <div className={s.explainerBody}>{currentExplainer ?? explainer}</div>
          </section>

          <footer className={s.footer}>
            <div>
              {prevDay ? (
                <Link href={dayHref(prevDay)}>← day {formatDay(prevDay)}</Link>
              ) : null}
            </div>
            <span>caskfinance.com</span>
            <div>
              {nextDay ? (
                <Link href={dayHref(nextDay)}>day {formatDay(nextDay)} →</Link>
              ) : null}
            </div>
          </footer>
        </div>

        <Link className={s.watermark} href="/" aria-label="Cask home">
          <span>C</span>
          <strong>CASK</strong>
        </Link>
      </main>
    </PlayShellContext.Provider>
  );
}
