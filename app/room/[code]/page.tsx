"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { LobbyScreen } from "@/components/screens/LobbyScreen";
import { VotingScreen } from "@/components/screens/VotingScreen";
import { RevealScreen } from "@/components/screens/RevealScreen";
import { FinalScreen } from "@/components/screens/FinalScreen";

function getStoredPlayer(): { playerId: string; playerName: string } | null {
  if (typeof window === "undefined") return null;
  const playerId = localStorage.getItem("playerId");
  const playerName = localStorage.getItem("playerName");
  if (!playerId || !playerName) return null;
  return { playerId, playerName };
}

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredPlayer();
    if (stored) {
      setPlayerId(stored.playerId);
    } else {
      // Redirect home with code pre-filled so they can join directly
      window.location.href = `/?join=${code}`;
    }
  }, []);

  const { room, myPlayer, isHost, loading, error } = useRoom(code, playerId);

  if (!playerId || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-violet-50">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">🎯</div>
          <p className="text-zinc-500 font-medium">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-violet-50 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">😬</div>
          <h2 className="text-xl font-bold text-zinc-900">Room not found</h2>
          <p className="text-zinc-500 text-sm">{error}</p>
          <a
            href="/"
            className="inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!room) return null;

  // Player not in room (shouldn't happen but guard anyway)
  if (!myPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-violet-50 px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">🚪</div>
          <h2 className="text-xl font-bold text-zinc-900">You&apos;re not in this room</h2>
          <a href="/" className="inline-block rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  switch (room.phase) {
    case "lobby":
      return <LobbyScreen room={room} playerId={playerId} isHost={isHost} />;
    case "voting":
      return <VotingScreen room={room} playerId={playerId} />;
    case "reveal":
      return <RevealScreen room={room} playerId={playerId} isHost={isHost} />;
    case "final":
      return <FinalScreen room={room} playerId={playerId} />;
    default:
      return null;
  }
}
