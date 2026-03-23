import { NextResponse } from "next/server";
import { getRoom, saveRoom, pruneStale, touchPlayer } from "@/lib/rooms";

type Params = { params: Promise<{ code: string }> };

// GET — poll current room state (also heartbeats the caller)
export async function GET(req: Request, { params }: Params) {
  const { code } = await params;
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");

  let room = await getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Heartbeat + prune stale players
  if (playerId) {
    room = touchPlayer(room, playerId);
  }
  room = pruneStale(room);
  await saveRoom(room);

  return NextResponse.json(room);
}

// POST — join a room
export async function POST(req: Request, { params }: Params) {
  const { code } = await params;
  const { playerName, playerId } = await req.json();

  if (!playerName || !playerId) {
    return NextResponse.json({ error: "Missing playerName or playerId" }, { status: 400 });
  }

  let room = await getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.phase !== "lobby") {
    return NextResponse.json({ error: "Game already started" }, { status: 409 });
  }

  // Add player if not already in the room
  const existing = room.players.find((p) => p.id === playerId);
  if (!existing) {
    room.players.push({ id: playerId, name: playerName, joinedAt: Date.now(), lastSeen: Date.now() });
    room.scores[playerId] = 0;
  }

  await saveRoom(room);
  return NextResponse.json(room);
}
