"use client";

import { useEffect, useRef, useState } from "react";
import type { Room, Player } from "@/lib/rooms";

interface UseRoomResult {
  room: Room | null;
  myPlayer: Player | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
}

export function useRoom(code: string, playerId: string | null): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!code || !playerId) return;

    async function poll() {
      try {
        const res = await fetch(`/api/rooms/${code}?playerId=${playerId}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Room not found");
          return;
        }
        const data: Room = await res.json();
        setRoom(data);
        setError(null);
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code, playerId]);

  const myPlayer = room?.players.find((p) => p.id === playerId) ?? null;
  const isHost = room?.hostId === playerId;

  return { room, myPlayer, isHost, loading, error };
}
