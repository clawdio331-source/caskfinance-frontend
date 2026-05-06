import type { Metadata } from "next";
import Link from "next/link";
import { DAYS, RELEASED_DAYS } from "./_data/days";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Cask · Daily v4 Minigames",
  description: "Play the released Cask Finance daily v4 minigames."
};

function formatDay(dayNumber: number) {
  return String(dayNumber).padStart(2, "0");
}

export default function PlayIndexPage() {
  return (
    <main className={s.page}>
      <div className={s.bg} aria-hidden="true" />
      <div className={s.container}>
        <nav className={s.nav} aria-label="Play navigation">
          <Link className={s.brand} href="/">
            <span>C</span>
            <strong>Cask</strong>
          </Link>
          <Link className={s.navLink} href="/play/01">play day 01</Link>
        </nav>

        <header className={s.header}>
          <p>◦ DAILY v4 MINIGAMES</p>
          <h1>play what&apos;s unlocked.</h1>
          <span aria-hidden="true" />
          <small>one new primitive unlocks each day. today, only day 01 is open.</small>
        </header>

        <section className={s.released} aria-label="Released games">
          {RELEASED_DAYS.map((day) => (
            <Link className={s.releaseCard} href={`/play/${day.id}`} key={day.id}>
              <span>DAY {day.id}</span>
              <h2>{day.title}</h2>
              <p>{day.subtitle}</p>
              <strong>play now →</strong>
            </Link>
          ))}
        </section>

        <section className={s.archive} aria-label="Upcoming games">
          <h2>locked casks</h2>
          <div className={s.lockedGrid}>
            {DAYS.filter((day) => !day.released).map((day) => (
              <article className={s.lockedCard} key={day.id}>
                <span>DAY {formatDay(day.number)}</span>
                <h3>{day.category.toLowerCase()}</h3>
                <p>{day.title}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
