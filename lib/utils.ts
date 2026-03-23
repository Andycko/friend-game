import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
  }
  return code;
}

export function generatePlayerId(): string {
  return crypto.randomUUID();
}
