import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/rooms";

type Params = { params: Promise<{ code: string }> };

export async function POST(req: Request, { params }: Params) {
  const { code } = await params;
  const { voterId, targetId } = await req.json();

  if (!voterId || !targetId) {
    return NextResponse.json({ error: "Missing voterId or targetId" }, { status: 400 });
  }

  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.phase !== "voting") return NextResponse.json({ error: "Not in voting phase" }, { status: 409 });

  const isPlayer = room.players.some((p) => p.id === voterId);
  const isTarget = room.players.some((p) => p.id === targetId);
  if (!isPlayer || !isTarget) {
    return NextResponse.json({ error: "Invalid player" }, { status: 400 });
  }

  const updatedVotes: Record<string, string> = { ...room.votes, [voterId]: targetId };
  const allVoted = room.players.every((p) => updatedVotes[p.id]);

  const updatedRoom = { ...room, votes: updatedVotes };

  // Auto-advance to reveal when everyone has voted
  if (allVoted) {
    updatedRoom.phase = "reveal";
  }

  await saveRoom(updatedRoom);
  return NextResponse.json({ ok: true, allVoted });
}
