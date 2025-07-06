import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toWords } from "number-to-words";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertToINRWords(amount: number): string {
  const [rupees, paise] = amount.toFixed(2).split(".");

  let words = "";

  if (parseInt(rupees, 10) > 0) {
    words += `${toWords(parseInt(rupees))} rupees`;
  }

  if (parseInt(paise, 10) > 0) {
    words += ` and ${toWords(parseInt(paise))} paise`;
  }

  return words ? `${words} only` : "Zero rupees only";
}


export function formatDateTimeByAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
  }

  // Show actual date after a week
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}