import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComingSoon from "../_components/ComingSoon";
import PlayShell from "../_components/PlayShell";
import { DAYS, dayById } from "../_data/days";
import SwapRouting from "../_games/SwapRouting";
import s from "./page.module.css";

type PlayPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function dayNav(dayNumber: number) {
  return {
    prevDay: dayNumber > 1 ? dayNumber - 1 : undefined,
    nextDay: dayNumber < DAYS.length ? dayNumber + 1 : undefined
  };
}

export function generateStaticParams() {
  return DAYS.map((day) => ({ id: day.id }));
}

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { id } = await params;
  const day = dayById(id);

  if (!day) {
    return {
      title: "Cask · Daily v4 Minigames"
    };
  }

  return {
    title: `Cask · Day ${day.id} — ${day.category}`,
    description: day.subtitle
  };
}

export default async function PlayDayPage({ params }: PlayPageProps) {
  const { id } = await params;
  const day = dayById(id);

  if (!day) {
    notFound();
  }

  const { prevDay, nextDay } = dayNav(day.number);
  const isDayOne = day.id === "01";

  return (
    <div className={s.route}>
      <PlayShell
        dayNumber={day.number}
        category={day.category}
        title={day.title}
        subtitle={day.subtitle}
        prevDay={prevDay}
        nextDay={nextDay}
        explainer={
          isDayOne ? (
            <p>pick a config. build the route. run it.</p>
          ) : (
            <p>this minigame is shipping soon. follow @caskfinance on twitter.</p>
          )
        }
      >
        {isDayOne ? <SwapRouting /> : <ComingSoon />}
      </PlayShell>
    </div>
  );
}
