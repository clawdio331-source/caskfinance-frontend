import s from "./page.module.css";

const TG_URL = "https://t.me/caskfinance";

const split = [
  { pct: 35, label: "LP Rewards", color: "#d4a24c" },
  { pct: 30, label: "Defense Pool", color: "#b8861f" },
  { pct: 15, label: "Buyback", color: "#b87333" },
  { pct: 10, label: "Treasury", color: "#8a4f1f" },
  { pct: 5, label: "Referrals", color: "#e8b85c" },
  { pct: 5, label: "Liquidity Extension", color: "#6e1f2c" }
];

function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.95 4.36 18.7 19.7c-.24 1.07-.88 1.34-1.78.83l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.36-5.02 9.13-8.25c.4-.35-.09-.55-.61-.2L7.23 13.36 2.36 11.84c-1.06-.33-1.08-1.06.22-1.57l19.05-7.34c.88-.33 1.65.2 1.32 1.43Z" />
    </svg>
  );
}

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={s.page}>
      {/* nav */}
      <nav className={s.nav}>
        <div className={`${s.container} ${s.navInner}`}>
          <a href="#top" className={s.brand}>
            <span className={s.brandMark}>C</span>
            <span className={s.brandWord}>Cask</span>
          </a>
          <div className={s.navLinks}>
            <a href="#mechanism" className={s.navLink}>Mechanism</a>
            <a href="#flow" className={s.navLink}>How it works</a>
            <a href="#split" className={s.navLink}>Split</a>
            <a
              href={TG_URL}
              target="_blank"
              rel="noreferrer"
              className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`}
            >
              <TelegramIcon size={15} />
              Early access
            </a>
          </div>
        </div>
      </nav>

      {/* hero */}
      <section id="top" className={s.hero}>
        <div className={s.heroBg} />
        <div className={`${s.container} ${s.heroContent}`}>
          <div className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            Early access · Limited seats
          </div>
          <h1 className={`${s.serif} ${s.headline}`}>
            A stablecoin that <span className={`${s.accent} ${s.italic}`}>fights</span> for its peg.
          </h1>
          <p className={s.subhead}>
            Cask ships peg defense inside the swap. Atomic. Brutal. On every trade — no keepers, no oracle delay, no prayers.
          </p>
          <div className={s.heroCtas}>
            <a
              href={TG_URL}
              target="_blank"
              rel="noreferrer"
              className={`${s.btn} ${s.btnPrimary}`}
            >
              <TelegramIcon />
              Get the keys
              <Arrow />
            </a>
            <a href="#mechanism" className={`${s.btn} ${s.btnGhost}`}>
              How it works
            </a>
          </div>
          <div className={s.heroSeats}>
            <strong>Whitelist · Alpha · First Liquidity</strong> — Telegram only
          </div>
        </div>
      </section>

      {/* pitch */}
      <section id="mechanism" className={s.section}>
        <div className={s.container}>
          <div className={s.sectionLabel}>The mechanism</div>
          <h2 className={`${s.serif} ${s.sectionHeading}`}>
            Old-world discipline. <span className={s.italic}>New-world execution.</span>
          </h2>
          <p className={s.sectionLede}>
            Three things every serious stablecoin has wished for. Cask ships them on day one.
          </p>

          <div className={s.pitchGrid}>
            <article className={s.card}>
              <div className={s.cardNum}>I.</div>
              <h3 className={s.cardTitle}>Defense in the swap.</h3>
              <p className={s.cardBody}>
                The peg defends itself, atomically, inside every trade. No keepers, no off-chain bots, no MEV vampires
                front-running the rebalance. The fight finishes before the block does.
              </p>
            </article>

            <article className={s.card}>
              <div className={s.cardNum}>II.</div>
              <h3 className={s.cardTitle}>Profit flows out.</h3>
              <p className={s.cardBody}>
                Every basis point the protocol earns is split — LPs, defense, buyback, referrers. Cask doesn&apos;t
                hoard yield. It pays it out, in-block, every block.
              </p>
            </article>

            <article className={s.card}>
              <div className={s.cardNum}>III.</div>
              <h3 className={s.cardTitle}>Engineered to age.</h3>
              <p className={s.cardBody}>
                Capped APR. Auction-backed reserves. Time-weighted exits. The discipline is sealed in from day one —
                what&apos;s inside only gets better with time.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* mantra */}
      <section className={s.mantra}>
        <div className={s.container}>
          <p className={s.mantraText}>
            The best stablecoins are the ones <span className={s.accent}>you don&apos;t have to think about.</span>
          </p>
          <div className={s.mantraRule} />
        </div>
      </section>

      {/* how it works */}
      <section id="flow" className={s.section}>
        <div className={s.container}>
          <div className={s.sectionLabel}>The flow</div>
          <h2 className={`${s.serif} ${s.sectionHeading}`}>
            One transaction. <span className={s.italic}>Three jobs done.</span>
          </h2>
          <p className={s.sectionLede}>
            Every Cask trade routes through a Uniswap v4 hook before it settles. That&apos;s where the magic — and
            the math — happens.
          </p>

          <div className={s.steps}>
            <div className={s.step}>
              <div className={`${s.serif} ${s.stepNum}`}>01</div>
              <div className={s.stepBody}>
                <h3>Swap hits the hook.</h3>
                <p>
                  Any trade against the Cask pool routes through the v4 hook before the AMM does its work.
                  Pre-trade, in the same transaction.
                </p>
              </div>
            </div>

            <div className={s.step}>
              <div className={`${s.serif} ${s.stepNum}`}>02</div>
              <div className={s.stepBody}>
                <h3>The hook decides.</h3>
                <p>
                  Reads peg state. Sets the dynamic fee. Triggers reserve swing-trading or auction backstop if the
                  peg is drifting. Blocks unsafe buys in recovery. All in one tx — no coordination cost.
                </p>
              </div>
            </div>

            <div className={s.step}>
              <div className={`${s.serif} ${s.stepNum}`}>03</div>
              <div className={s.stepBody}>
                <h3>Profit splits in-block.</h3>
                <p>
                  Realized stability profit flows to LPs, bonders, the defense reserve, and the buyback the moment
                  it&apos;s earned. No epoch lag. No keeper paid to do the splitting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* split */}
      <section id="split" className={s.section}>
        <div className={s.container}>
          <div className={s.sectionLabel}>The split</div>
          <h2 className={`${s.serif} ${s.sectionHeading}`}>
            Where every basis point goes.
          </h2>
          <p className={s.sectionLede}>
            Cask earns from peg defense. Cask gives it back. The protocol keeps a tenth.
          </p>

          <div className={s.split}>
            <div className={s.splitBar}>
              {split.map((seg) => (
                <div
                  key={seg.label}
                  className={s.splitSeg}
                  style={{ flexBasis: `${seg.pct}%`, background: seg.color }}
                  title={`${seg.pct}% — ${seg.label}`}
                >
                  {seg.pct >= 10 ? `${seg.pct}%` : ""}
                </div>
              ))}
            </div>
            <div className={s.splitLegend}>
              {split.map((seg) => (
                <div key={seg.label} className={s.legendItem}>
                  <span className={s.legendDot} style={{ background: seg.color }} />
                  <div className={s.legendText}>
                    <span className={s.legendPct}>{seg.pct}%</span>
                    <span className={s.legendLabel}>{seg.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* final cta */}
      <section className={s.finalCta}>
        <div className={s.container}>
          <div className={s.finalContent}>
            <h2 className={s.finalHeading}>
              Seats are <span className={s.accent}>limited.</span>
            </h2>
            <p className={s.finalSub}>
              Whitelist, alpha drops, first liquidity. Everything starts in the Telegram.
            </p>
            <a
              href={TG_URL}
              target="_blank"
              rel="noreferrer"
              className={`${s.btn} ${s.btnPrimary}`}
            >
              <TelegramIcon />
              Get the keys
              <Arrow />
            </a>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerInner}`}>
          <div>© Cask Finance</div>
          <div className={s.footerLinks}>
            <a href={TG_URL} target="_blank" rel="noreferrer">Telegram</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
