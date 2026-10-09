import { useEffect, useState } from "react";

/** One slider: its range, step and default value. */
export type TuningSpec = { label: string; min: number; max: number; step: number; value: number };
export type TuningSpecs = Record<string, TuningSpec>;
export type TuningValues<T extends TuningSpecs> = { [K in keyof T]: number };

type Group = { title: string; specs: TuningSpecs; values: Record<string, number>; mounted: number };

const STORAGE_KEY = "haven-tuning";
const groups = new Map<string, Group>();
const listeners = new Set<() => void>();

/** Sliders only exist in dev, or on any build when the URL has `?tune`. */
export function tuningEnabled() {
  if (typeof window === "undefined") return false;
  return process.env.NODE_ENV === "development" || new URLSearchParams(window.location.search).has("tune");
}

const defaultsOf = (specs: TuningSpecs) =>
  Object.fromEntries(Object.entries(specs).map(([key, spec]) => [key, spec.value]));

const clampTo = (spec: TuningSpec, value: number) => Math.min(spec.max, Math.max(spec.min, value));

function readSaved(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(changedTuning()));
  listeners.forEach((listener) => listener());
}

export function subscribeTuning(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Groups whose component is on screen right now. */
export function visibleTuningGroups() {
  return [...groups.entries()].filter(([, group]) => group.mounted > 0);
}

export function setTuning(id: string, key: string, value: number) {
  const group = groups.get(id);
  if (!group) return;
  group.values = { ...group.values, [key]: clampTo(group.specs[key], value) };
  emit();
}

export function resetTuning(id: string) {
  const group = groups.get(id);
  if (!group) return;
  group.values = defaultsOf(group.specs);
  emit();
}

/** Only the values someone moved away from their default, grouped by id. */
export function changedTuning() {
  const out: Record<string, Record<string, number>> = {};
  groups.forEach((group, id) => {
    for (const [key, spec] of Object.entries(group.specs)) {
      if (group.values[key] !== spec.value) (out[id] ??= {})[key] = group.values[key];
    }
  });
  return out;
}

/**
 * Returns the defaults on the server and first render (so hydration matches),
 * then live slider values once tuning is enabled.
 */
export function useTuning<T extends TuningSpecs>(id: string, title: string, specs: T): TuningValues<T> {
  const [values, setValues] = useState(() => defaultsOf(specs));

  useEffect(() => {
    if (!tuningEnabled()) return;
    let group = groups.get(id);
    if (!group) {
      const saved = readSaved()[id] ?? {};
      const initial = defaultsOf(specs);
      for (const key of Object.keys(specs)) {
        if (typeof saved[key] === "number") initial[key] = clampTo(specs[key], saved[key]);
      }
      group = { title, specs, values: initial, mounted: 0 };
      groups.set(id, group);
    }
    group.mounted++;
    const sync = () => setValues(groups.get(id)!.values);
    const unsubscribe = subscribeTuning(sync);
    emit();
    return () => {
      unsubscribe();
      group.mounted--;
      listeners.forEach((listener) => listener());
    };
  }, [id, title, specs]);

  return values as TuningValues<T>;
}
