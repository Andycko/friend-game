import { NextResponse } from "next/server";
import { generateRoomCode } from "@/lib/utils";
import { getRoom, saveRoom, roomExists } from "@/lib/rooms";
import { pickPrompts } from "@/lib/prompts";
import type { Room } from "@/lib/rooms";

export async function POST(req: Request) {
  const { hostName, hostId } = await req.json();

  if (!hostName || !hostId) {
    return NextResponse.json({ error: "Missing hostName or hostId" }, { status: 400 });
  }

  // Generate a unique room code
  let code = generateRoomCode();
  let attempts = 0;
  while ((await roomExists(code)) && attempts < 10) {
    code = generateRoomCode();
    attempts++;
  }

  const room: Room = {
    code,
    phase: "lobby",
    hostId,
    players: [{ id: hostId, name: hostName, joinedAt: Date.now(), lastSeen: Date.now() }],
    prompts: pickPrompts(5),
    promptIndex: 0,
    votes: {},
    scores: { [hostId]: 0 },
    createdAt: Date.now(),
  };

  await saveRoom(room);
  return NextResponse.json({ code });
}
