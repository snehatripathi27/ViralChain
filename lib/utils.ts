import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uniqueBy<T>(items: T[], select: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = select(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value > 9999 ? 1 : 0
  }).format(value);
}

export function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}
