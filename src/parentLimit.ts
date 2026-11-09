import type { AnimalKey } from './animals';

export const ANY_ANIMAL = 'any';
export type GoalAnimal = AnimalKey | typeof ANY_ANIMAL;

// Forældrenes aftale med barnet: enten et tidspunkt, eller et antal dyr der skal findes fra nu af
export type ParentLimit =
  | { kind: 'time'; endsAt: number }
  | { kind: 'goal'; animal: GoalAnimal; target: number; found: number };

export interface ParentState {
  limit?: ParentLimit;
  locked: boolean;
}

const STORAGE_KEY = 'safari-parent-limit';

// Gemmes i browseren, så spillet stadig er låst, hvis siden genindlæses
export function loadParentState(): ParentState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (typeof saved?.locked === 'boolean') return saved;
  } catch {
    // Lageret kan være blokeret, fx i et privat vindue. Så gælder grænsen kun, til siden lukkes.
  }
  return { locked: false };
}

export function saveParentState(state: ParentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Se loadParentState
  }
}
