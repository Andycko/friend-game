import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/rooms";

type Params = { params: Promise<{ code: string }> };

export async function POST(req: Request, { params }: Params) {
  const { code } = await params;
  const { playerId } = await req.json();

  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not the host" }, { status: 403 });
  if (room.phase !== "lobby") return NextResponse.json({ error: "Already started" }, { status: 409 });
  if (room.players.length < 2) return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 });

  await saveRoom({ ...room, phase: "voting", votes: {} });
  return NextResponse.json({ ok: true });
}
