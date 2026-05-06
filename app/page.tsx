import s from "./page.module.css";
import CaskScene from "./CaskScene";

const TG_URL = "https://t.me/caskfinance";
const TWITTER_URL = "https://x.com/caskfinance";

export default function Home() {
  return (
    <main className={s.page}>
      <CaskScene telegramUrl={TG_URL} twitterUrl={TWITTER_URL} />
    </main>
  );
}
