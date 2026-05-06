"use client";

import { useCallback, useMemo, useState } from "react";
import { usePlayShell } from "../_components/PlayShell";
import s from "./SwapRouting.module.css";

type Mode = "v3" | "v4";
type PrimitiveId = "user" | "router" | "pool-contract" | "pool-manager" | "hook";
type FeedbackTone = "idle" | "error" | "success";

type Primitive = {
  id: PrimitiveId;
  label: string;
  subtitle: string;
  info: string;
};

const PRIMITIVES: Primitive[] = [
  {
    id: "user",
    label: "user",
    subtitle: "starts the swap",
    info: "the wallet asking for the trade. in this minigame, the user is always the first stop."
  },
  {
    id: "router",
    label: "router",
    subtitle: "packages the call",
    info: "the helper contract or interface path that formats the swap call before it reaches the pool layer."
  },
  {
    id: "pool-contract",
    label: "pool contract",
    subtitle: "v3 pair contract",
    info: "in v3, each pool pair has its own deployed contract. that is why the route ends at a specific pool contract."
  },
  {
    id: "pool-manager",
    label: "PoolManager",
    subtitle: "v4 singleton",
    info: "in v4, pools live inside one singleton contract called PoolManager. swaps route into that shared manager."
  },
  {
    id: "hook",
    label: "hook",
    subtitle: "optional v4 code",
    info: "a hook is custom code that can run at chosen v4 lifecycle moments. it is optional, but it is the new design lever."
  }
];

const EXPLAINERS = {
  default: <p>pick a config. build the route. run it.</p>,
  v3: (
    <p>
      in v3, every trading pair has its own pool contract. the swap goes user → router → pool.
      that&apos;s it. no shared state, no extensibility.
    </p>
  ),
  v4: (
    <p>
      in v4, every pool lives inside one contract called the PoolManager. the swap goes user →
      router → PoolManager. one contract holds all pools — that&apos;s the singleton design.
    </p>
  ),
  hook: (
    <p>
      in v4 with a hook, the swap also passes through your custom code: user → router →
      PoolManager → hook. the hook can read state, charge fees, gate the swap, or modify
      amounts. that&apos;s the new lever v4 unlocks.
    </p>
  )
};

function wait(duration: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function Arrow({ index, active }: { index: number; active: boolean }) {
  const markerId = `route-arrow-${index}`;

  return (
    <svg
      className={`${s.arrow} ${active ? s.arrowActive : ""}`}
      viewBox="0 0 32 16"
      aria-hidden="true"
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
      </defs>
      <path
        className={s.arrowLine}
        d="M1 8H28"
        markerEnd={`url(#${markerId})`}
        pathLength="32"
      />
    </svg>
  );
}

function getPrimitive(id: PrimitiveId) {
  return PRIMITIVES.find((primitive) => primitive.id === id);
}

function routeMatches(route: PrimitiveId[], expected: PrimitiveId[]) {
  return route.length === expected.length && route.every((id, index) => id === expected[index]);
}

export default function SwapRouting() {
  const [mode, setMode] = useState<Mode>("v4");
  const [includeHook, setIncludeHook] = useState(false);
  const [route, setRoute] = useState<PrimitiveId[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [feedback, setFeedback] = useState("tap the cards into the route slots.");
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("idle");
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);
  const [activeArrowIndex, setActiveArrowIndex] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedInfoId, setSelectedInfoId] = useState<PrimitiveId>("pool-manager");
  const { setExplainer } = usePlayShell();

  const expectedRoute = useMemo<PrimitiveId[]>(() => {
    if (mode === "v3") {
      return ["user", "router", "pool-contract"];
    }

    if (includeHook) {
      return ["user", "router", "pool-manager", "hook"];
    }

    return ["user", "router", "pool-manager"];
  }, [includeHook, mode]);

  const explainerKey = mode === "v3" ? "v3" : includeHook ? "hook" : "v4";
  const selectedInfo = getPrimitive(selectedInfoId) ?? PRIMITIVES[0];

  const resetPuzzle = useCallback((message = "tap the cards into the route slots.") => {
    setRoute([]);
    setIsSolved(false);
    setFeedback(message);
    setFeedbackTone("idle");
    setActiveBoxIndex(null);
    setActiveArrowIndex(null);
    setExplainer(EXPLAINERS.default);
  }, [setExplainer]);

  const handleModeChange = useCallback((nextMode: Mode) => {
    if (isRunning || nextMode === mode) {
      return;
    }

    setMode(nextMode);
    resetPuzzle(nextMode === "v3" ? "build the old pair-contract route." : "build the singleton route.");
  }, [isRunning, mode, resetPuzzle]);

  const handleHookChange = useCallback(() => {
    if (isRunning || mode !== "v4") {
      return;
    }

    const nextIncludeHook = !includeHook;
    setIncludeHook(nextIncludeHook);
    resetPuzzle(nextIncludeHook ? "now include the optional hook." : "remove the hook from the path.");
    if (nextIncludeHook) {
      setSelectedInfoId("hook");
    }
  }, [includeHook, isRunning, mode, resetPuzzle]);

  const addPrimitive = useCallback((id: PrimitiveId) => {
    if (isRunning || isSolved || route.length >= expectedRoute.length) {
      return;
    }

    setRoute((currentRoute) => [...currentRoute, id]);
    setFeedback("keep building the path.");
    setFeedbackTone("idle");
  }, [expectedRoute.length, isRunning, isSolved, route.length]);

  const removeLastPrimitive = useCallback(() => {
    if (isRunning || isSolved || route.length === 0) {
      return;
    }

    setRoute((currentRoute) => currentRoute.slice(0, -1));
    setFeedback("last card removed.");
    setFeedbackTone("idle");
  }, [isRunning, isSolved, route.length]);

  const checkRoute = useCallback(() => {
    if (isRunning) {
      return;
    }

    if (route.length < expectedRoute.length) {
      setFeedback("fill every slot before checking.");
      setFeedbackTone("error");
      return;
    }

    if (!routeMatches(route, expectedRoute)) {
      setIsSolved(false);
      setFeedback(mode === "v3" ? "v3 ends at the pair's pool contract." : "v4 routes into the PoolManager singleton.");
      setFeedbackTone("error");
      return;
    }

    setIsSolved(true);
    setFeedback("route locked. run the swap.");
    setFeedbackTone("success");
  }, [expectedRoute, isRunning, mode, route]);

  const runSwap = useCallback(async () => {
    if (isRunning || !isSolved) {
      return;
    }

    setIsRunning(true);
    setFeedback("swap moving through your route.");
    setFeedbackTone("success");
    setExplainer(EXPLAINERS.default);

    for (let index = 0; index < route.length; index += 1) {
      setActiveBoxIndex(index);
      setActiveArrowIndex(index > 0 ? index - 1 : null);
      await wait(650);
    }

    await wait(300);
    setActiveBoxIndex(null);
    setActiveArrowIndex(null);
    setExplainer(EXPLAINERS[explainerKey]);
    setFeedback("swap settled. change the config and try another route.");
    setIsRunning(false);
  }, [explainerKey, isRunning, isSolved, route, setExplainer]);

  return (
    <div className={s.widget}>
      <div className={s.segmented} aria-label="Protocol version">
        <button
          type="button"
          className={mode === "v3" ? s.segmentActive : s.segment}
          onClick={() => handleModeChange("v3")}
          disabled={isRunning}
        >
          v3
        </button>
        <button
          type="button"
          className={mode === "v4" ? s.segmentActive : s.segment}
          onClick={() => handleModeChange("v4")}
          disabled={isRunning}
        >
          v4
        </button>
      </div>

      {mode === "v4" ? (
        <label className={s.hookToggle}>
          <input
            type="checkbox"
            checked={includeHook}
            onChange={handleHookChange}
            disabled={isRunning}
          />
          <span aria-hidden="true" />
          include hook
        </label>
      ) : null}

      <div className={s.challenge}>
        <span>OBJECTIVE</span>
        <p>{mode === "v3" ? "build the v3 route to a pair pool." : includeHook ? "build the v4 route with a hook." : "build the v4 singleton route."}</p>
      </div>

      <div className={s.pipelineCard}>
        <div className={s.pipelineFlow}>
          {expectedRoute.map((_, index) => {
            const primitive = route[index] ? getPrimitive(route[index]) : undefined;
            const isActive = activeBoxIndex === index;
            const isDimmed = isRunning && !isActive;
            const isHook = primitive?.id === "hook";
            const slotClassName = [
              s.routeSlot,
              primitive ? s.filledSlot : "",
              isHook ? s.hookSlot : "",
              isActive ? s.activeSlot : "",
              isDimmed ? s.dimmedSlot : ""
            ].filter(Boolean).join(" ");

            return (
              <div className={s.pipelineStep} key={`slot-${index}`}>
                {isHook ? <span className={s.optional}>OPTIONAL</span> : null}
                <div className={slotClassName}>
                  {primitive ? (
                    <>
                      <strong>{primitive.label}</strong>
                      <small>{primitive.subtitle}</small>
                    </>
                  ) : (
                    <span>slot {index + 1}</span>
                  )}
                </div>
                {index < expectedRoute.length - 1 ? (
                  <Arrow index={index} active={activeArrowIndex === index} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={s.primitiveDeck} aria-label="Route cards">
        {PRIMITIVES.map((primitive) => {
          const isDisabled = isRunning || isSolved || route.length >= expectedRoute.length;
          const cardClassName = [
            primitive.id === "hook" ? s.hookCard : s.primitiveCard,
            selectedInfoId === primitive.id ? s.cardSelected : ""
          ].filter(Boolean).join(" ");

          return (
            <div
              key={primitive.id}
              className={cardClassName}
            >
              <button
                type="button"
                className={s.cardAdd}
                onClick={() => addPrimitive(primitive.id)}
                disabled={isDisabled}
              >
                <strong>{primitive.label}</strong>
                <span>{primitive.subtitle}</span>
              </button>
              <button
                type="button"
                className={s.infoButton}
                onClick={() => setSelectedInfoId(primitive.id)}
                aria-label={`read about ${primitive.label}`}
              >
                i
              </button>
            </div>
          );
        })}
      </div>

      <aside className={s.infoPanel} aria-live="polite">
        <div>
          <span>READ MORE</span>
          <h3>{selectedInfo.label}</h3>
        </div>
        <p>{selectedInfo.info}</p>
      </aside>

      <p className={`${s.feedback} ${s[`feedback-${feedbackTone}`]}`} aria-live="polite">
        {feedback}
      </p>

      <div className={s.actions}>
        <button
          className={s.secondaryButton}
          type="button"
          onClick={removeLastPrimitive}
          disabled={isRunning || isSolved || route.length === 0}
        >
          undo
        </button>
        <button
          className={s.secondaryButton}
          type="button"
          onClick={() => resetPuzzle()}
          disabled={isRunning || route.length === 0}
        >
          reset
        </button>
        <button
          className={s.secondaryButton}
          type="button"
          onClick={checkRoute}
          disabled={isRunning || route.length === 0}
        >
          check route
        </button>
        <button
          className={s.runButton}
          type="button"
          onClick={runSwap}
          disabled={isRunning || !isSolved}
        >
          ▶ run swap
        </button>
      </div>
    </div>
  );
}
