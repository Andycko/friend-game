"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/rooms";

interface VotingScreenProps {
  room: Room;
  playerId: string;
}

export function VotingScreen({ room, playerId }: VotingScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const prompt = room.prompts[room.promptIndex];
  const hasVoted = !!room.votes[playerId];
  const votedCount = Object.keys(room.votes).length;
  const totalPlayers = room.players.length;
  const roundLabel = `${room.promptIndex + 1} / ${room.prompts.length}`;

  async function submitVote() {
    if (!selected || submitted) return;
    setLoading(true);
    await fetch(`/api/rooms/${room.code}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: playerId, targetId: selected }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-5">
        {/* Round indicator */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Round {roundLabel}</Badge>
          <Badge variant="accent">
            {votedCount}/{totalPlayers} voted
          </Badge>
        </div>

        {/* Prompt */}
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
              Most Likely To...
            </p>
            <p className="text-2xl font-black text-zinc-900 leading-tight">{prompt}</p>
          </CardContent>
        </Card>

        {/* Player list to vote on */}
        {!hasVoted && !submitted ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-500 text-center font-medium">Tap to select</p>
            {room.players.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelected(selected === player.id ? null : player.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all text-left",
                  selected === player.id
                    ? "border-violet-600 bg-violet-50 shadow-md scale-[1.01]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <Avatar name={player.name} size="md" />
                <span className="flex-1 text-base font-semibold text-zinc-900">{player.name}</span>
                {selected === player.id && (
                  <span className="text-violet-600 text-lg">✓</span>
                )}
              </button>
            ))}
            <Button
              className="w-full mt-2"
              variant="accent"
              size="lg"
              onClick={submitVote}
              disabled={!selected || loading}
            >
              {loading ? "Submitting..." : "Lock In Vote"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 py-6 text-center">
              <p className="text-4xl mb-2">🔒</p>
              <p className="font-bold text-zinc-900">Vote locked in!</p>
              <p className="text-sm text-zinc-500 mt-1">
                Waiting for others... ({votedCount}/{totalPlayers})
              </p>
            </div>
            {/* Show who they voted for */}
            {selected && (
              <div className="rounded-xl bg-white border border-zinc-100 px-4 py-3 flex items-center gap-3">
                <span className="text-sm text-zinc-400">You voted for</span>
                <Avatar name={room.players.find(p => p.id === selected)?.name ?? "?"} size="sm" />
                <span className="font-semibold text-zinc-900">
                  {room.players.find(p => p.id === selected)?.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
