import { NextResponse } from "next/server";
import { getRoom, saveRoom, tallyVotes } from "@/lib/rooms";

type Params = { params: Promise<{ code: string }> };

export async function POST(req: Request, { params }: Params) {
  const { code } = await params;
  const { playerId } = await req.json();

  const room = await getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not the host" }, { status: 403 });
  if (room.phase !== "reveal") return NextResponse.json({ error: "Not in reveal phase" }, { status: 409 });

  // Tally votes and update scores
  const { winnerId } = tallyVotes(room);
  const newScores = { ...room.scores };
  if (winnerId) {
    newScores[winnerId] = (newScores[winnerId] ?? 0) + 1;
  }

  const nextIndex = room.promptIndex + 1;
  const isLast = nextIndex >= room.prompts.length;

  const updatedRoom = {
    ...room,
    scores: newScores,
    votes: {},
    promptIndex: isLast ? room.promptIndex : nextIndex,
    phase: isLast ? ("final" as const) : ("voting" as const),
  };

  await saveRoom(updatedRoom);
  return NextResponse.json({ ok: true });
}
