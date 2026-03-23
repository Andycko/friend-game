import { redis } from "./redis";

export type Phase = "lobby" | "voting" | "reveal" | "final";

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  lastSeen: number;
}

export interface Room {
  code: string;
  phase: Phase;
  hostId: string;
  players: Player[];
  prompts: string[];
  promptIndex: number;
  votes: Record<string, string>; // voterId -> targetPlayerId
  scores: Record<string, number>; // playerId -> win count
  createdAt: number;
}

const ROOM_TTL = 60 * 60 * 2; // 2 hours
const STALE_THRESHOLD = 15_000; // 15 seconds

function roomKey(code: string) {
  return `room:${code}`;
}

export async function getRoom(code: string): Promise<Room | null> {
  const data = await redis.get<Room>(roomKey(code));
  return data ?? null;
}

export async function saveRoom(room: Room): Promise<void> {
  await redis.set(roomKey(room.code), room, { ex: ROOM_TTL });
}

export async function roomExists(code: string): Promise<boolean> {
  return (await redis.exists(roomKey(code))) === 1;
}

export function pruneStale(room: Room): Room {
  const now = Date.now();
  const activePlayers = room.players.filter(
    (p) => now - p.lastSeen < STALE_THRESHOLD
  );
  return { ...room, players: activePlayers };
}

export function touchPlayer(room: Room, playerId: string): Room {
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, lastSeen: Date.now() } : p
    ),
  };
}

export function tallyVotes(room: Room): { winnerId: string | null; voteCounts: Record<string, number> } {
  const voteCounts: Record<string, number> = {};
  for (const playerId of room.players.map((p) => p.id)) {
    voteCounts[playerId] = 0;
  }
  for (const targetId of Object.values(room.votes)) {
    if (voteCounts[targetId] !== undefined) {
      voteCounts[targetId]++;
    }
  }
  let maxVotes = 0;
  let winnerId: string | null = null;
  for (const [id, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = id;
    }
  }
  return { winnerId, voteCounts };
}
