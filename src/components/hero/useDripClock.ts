import { useEffect, useRef, useState } from 'react';
import { HERO_TIMINGS } from './heroConstants';

export interface DripCycleSample {
  /** Saniye cinsinden ortak aktif saat */
  uTime: number;
  /** 0..1 arası pürüzsüz akış yoğunluğu (aktif 2.5 sn pencerede yükselip diner) */
  uCycle: number;
  /** 6 sn periyot içindeki 0..1 normalize ilerleme */
  periodProgress01: number;
  /** Aktif 2.5 sn damla penceresi içinde mi */
  isActive: boolean;
  /** Mevcut seans indeksi (0, 1, 2...) */
  sessionIndex: number;
  /** Aktif seans içindeki geçen süre (ms) */
  sessionElapsedMs: number;
}

interface SharedClockSnapshot {
  isSessionActive: boolean;
  sessionIndex: number;
}

type SessionListener = (snapshot: SharedClockSnapshot, isNewSession: boolean) => void;

/**
 * Splash sonrası sıfırlanan, sekme gizlendiğinde/duraklatıldığında zamanı donduran
 * tek merkezli paylaşılan zamanlayıcı durumu.
 */
let accumulatedActiveMs = 0;
let runningSinceMs: number | null = null;
let lastEmittedSession = -1;
let lastEmittedActive = false;
let schedulerTimer: number | undefined;

const activeConsumers = new Set<symbol>();
const pausedConsumers = new Set<symbol>();
const listeners = new Set<SessionListener>();

function nowTimestamp(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function isClockRunning(): boolean {
  return activeConsumers.size > 0 && pausedConsumers.size < activeConsumers.size;
}

function getActiveElapsedMs(now = nowTimestamp()): number {
  if (runningSinceMs !== null) {
    return accumulatedActiveMs + Math.max(0, now - runningSinceMs);
  }
  return accumulatedActiveMs;
}

function syncClockRunningState(now = nowTimestamp()): void {
  const shouldRun = isClockRunning();
  if (shouldRun && runningSinceMs === null) {
    runningSinceMs = now;
  } else if (!shouldRun && runningSinceMs !== null) {
    accumulatedActiveMs += Math.max(0, now - runningSinceMs);
    runningSinceMs = null;
  }
}

function clearScheduler(): void {
  if (schedulerTimer !== undefined && typeof window !== 'undefined') {
    window.clearTimeout(schedulerTimer);
    schedulerTimer = undefined;
  }
}

function notifyAndScheduleNext(): void {
  clearScheduler();
  if (typeof window === 'undefined') return;

  const now = nowTimestamp();
  const sample = sampleSharedDripClock(now);
  const isNewSession =
    sample.isActive &&
    sample.sessionIndex >= 0 &&
    sample.sessionIndex !== lastEmittedSession;

  if (isNewSession) {
    lastEmittedSession = sample.sessionIndex;
  }

  if (sample.isActive !== lastEmittedActive || isNewSession) {
    lastEmittedActive = sample.isActive;
    const snapshot: SharedClockSnapshot = {
      isSessionActive: sample.isActive,
      sessionIndex: sample.sessionIndex,
    };
    listeners.forEach((fn) => fn(snapshot, isNewSession));
  }

  if (!isClockRunning()) {
    return;
  }

  const elapsedMs = getActiveElapsedMs(now);
  const { initialDripDelayMs, dripPeriodMs, dripActiveMs } = HERO_TIMINGS;

  let waitMs: number;
  if (elapsedMs < initialDripDelayMs) {
    waitMs = initialDripDelayMs - elapsedMs;
  } else {
    const sinceFirst = elapsedMs - initialDripDelayMs;
    const inPeriod = sinceFirst % dripPeriodMs;
    if (inPeriod < dripActiveMs) {
      waitMs = dripActiveMs - inPeriod;
    } else {
      waitMs = dripPeriodMs - inPeriod;
    }
  }

  schedulerTimer = window.setTimeout(
    notifyAndScheduleNext,
    Math.max(16, Math.ceil(waitMs) + 4)
  );
}

/**
 * Splash kapandığında veya başlangıç fazı hizalanmak istendiğinde
 * başlık ve 3D pasta saatini aynı 0ms noktasına kilitler.
 */
export function resetSharedDripClock(): void {
  const now = nowTimestamp();
  accumulatedActiveMs = 0;
  runningSinceMs = isClockRunning() ? now : null;
  lastEmittedSession = -1;
  lastEmittedActive = false;

  const snapshot: SharedClockSnapshot = {
    isSessionActive: false,
    sessionIndex: -1,
  };
  listeners.forEach((fn) => fn(snapshot, false));
  notifyAndScheduleNext();
}

/**
 * Geriye dönük uyumluluk için ortak epoch sıfırlama alias'ı
 */
export function resetSharedDripEpochMs(): void {
  resetSharedDripClock();
}

/**
 * Herhangi bir anda (ör. Three.js useFrame içinde re-render üretmeden)
 * paylaşılan 6 sn periyot / 2.5 sn aktif çikolata akışı fazını hesaplar.
 */
export function sampleSharedDripClock(nowMs = nowTimestamp()): DripCycleSample {
  const totalElapsedMs = getActiveElapsedMs(nowMs);
  const uTime = totalElapsedMs / 1000;

  if (totalElapsedMs < HERO_TIMINGS.initialDripDelayMs) {
    return {
      uTime,
      uCycle: 0,
      periodProgress01: 0,
      isActive: false,
      sessionIndex: -1,
      sessionElapsedMs: 0,
    };
  }

  const sinceFirstMs = totalElapsedMs - HERO_TIMINGS.initialDripDelayMs;
  const periodMs = HERO_TIMINGS.dripPeriodMs;
  const activeMs = HERO_TIMINGS.dripActiveMs;

  const sessionIndex = Math.floor(sinceFirstMs / periodMs);
  const sessionElapsedMs = sinceFirstMs % periodMs;
  const periodProgress01 = sessionElapsedMs / periodMs;
  const isActive = sessionElapsedMs <= activeMs;

  let uCycle = 0;
  if (isActive) {
    const t = sessionElapsedMs / activeMs; // 0..1
    // Yumuşak çan eğrisi: yavaşça uzar, uçta dolgunlaşır, dinlenmeye döner
    uCycle = Math.sin(Math.PI * Math.pow(t, 0.85));
  }

  return {
    uTime,
    uCycle,
    periodProgress01,
    isActive,
    sessionIndex,
    sessionElapsedMs,
  };
}

export interface UseDripClockOptions {
  isPaused: boolean;
  onSessionStart?: (sessionIndex: number) => void;
}

/**
 * Hero başlığı (DripDrops) ve 3D Yaş Pasta (ChocolateGlaze + CakeDrops)
 * tarafından ortak kullanılan pause-telafili senkron zamanlayıcı hook'u.
 */
export function useDripClock({ isPaused, onSessionStart }: UseDripClockOptions) {
  const consumerIdRef = useRef<symbol>(Symbol('drip-clock-consumer'));
  const onSessionStartRef = useRef(onSessionStart);
  onSessionStartRef.current = onSessionStart;

  const [clockState, setClockState] = useState<SharedClockSnapshot>(() => {
    const initial = sampleSharedDripClock();
    return {
      isSessionActive: isPaused ? false : initial.isActive,
      sessionIndex: initial.sessionIndex,
    };
  });

  useEffect(() => {
    const id = consumerIdRef.current;
    activeConsumers.add(id);

    const handleUpdate: SessionListener = (snapshot, isNewSession) => {
      setClockState(snapshot);
      if (isNewSession) {
        onSessionStartRef.current?.(snapshot.sessionIndex);
      }
    };

    listeners.add(handleUpdate);
    syncClockRunningState();
    notifyAndScheduleNext();

    return () => {
      activeConsumers.delete(id);
      pausedConsumers.delete(id);
      listeners.delete(handleUpdate);
      syncClockRunningState();
      if (activeConsumers.size === 0) {
        clearScheduler();
      } else {
        notifyAndScheduleNext();
      }
    };
  }, []);

  useEffect(() => {
    const id = consumerIdRef.current;
    if (isPaused) {
      pausedConsumers.add(id);
    } else {
      pausedConsumers.delete(id);
    }

    syncClockRunningState();
    notifyAndScheduleNext();

    if (isPaused) {
      setClockState((prev) =>
        prev.isSessionActive ? { ...prev, isSessionActive: false } : prev
      );
    }
  }, [isPaused]);

  return {
    isSessionActive: isPaused ? false : clockState.isSessionActive,
    sessionIndex: clockState.sessionIndex,
    sampleClock: sampleSharedDripClock,
    resetClock: resetSharedDripClock,
  };
}
