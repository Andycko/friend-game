"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Room } from "@/lib/rooms";

interface LobbyScreenProps {
  room: Room;
  playerId: string;
  isHost: boolean;
}

export function LobbyScreen({ room, playerId, isHost }: LobbyScreenProps) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function startGame() {
    setStarting(true);
    await fetch(`/api/rooms/${room.code}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    setStarting(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        {/* Room code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
              Room Code — share with friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={copyCode}
              className="w-full rounded-xl bg-zinc-900 py-4 text-center"
            >
              <span className="font-mono text-4xl font-black tracking-widest text-white">
                {room.code}
              </span>
              <p className="mt-1 text-xs text-zinc-400">
                {copied ? "Copied! ✓" : "Tap to copy"}
              </p>
            </button>
          </CardContent>
        </Card>

        {/* Players */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Players</CardTitle>
              <Badge variant="secondary">{room.players.length} joined</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5"
              >
                <Avatar name={player.name} size="sm" />
                <span className="flex-1 font-medium text-zinc-900">{player.name}</span>
                {player.id === room.hostId && (
                  <Badge variant="accent">Host</Badge>
                )}
                {player.id === playerId && player.id !== room.hostId && (
                  <Badge variant="secondary">You</Badge>
                )}
              </div>
            ))}
            {room.players.length < 2 && (
              <p className="text-center text-sm text-zinc-400 py-2">
                Waiting for at least 1 more player...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Game info */}
        <div className="text-center text-sm text-zinc-400 space-y-1">
          <p>🎯 5 rounds — vote for who fits each prompt</p>
          <p>Most votes = the winner (or victim)</p>
        </div>

        {/* Start button */}
        {isHost ? (
          <Button
            className="w-full"
            variant="accent"
            size="lg"
            onClick={startGame}
            disabled={starting || room.players.length < 2}
          >
            {starting ? "Starting..." : "Start Game"}
          </Button>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 py-4 text-center text-sm text-zinc-400">
            Waiting for the host to start...
          </div>
        )}
      </div>
    </div>
  );
}
