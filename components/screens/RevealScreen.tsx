"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { tallyVotes } from "@/lib/rooms";
import type { Room } from "@/lib/rooms";

interface RevealScreenProps {
  room: Room;
  playerId: string;
  isHost: boolean;
}

export function RevealScreen({ room, playerId, isHost }: RevealScreenProps) {
  const [advancing, setAdvancing] = useState(false);

  const { winnerId, voteCounts } = useMemo(() => tallyVotes(room), [room]);
  const winner = room.players.find((p) => p.id === winnerId);
  const prompt = room.prompts[room.promptIndex];
  const isLastRound = room.promptIndex + 1 >= room.prompts.length;

  // Sort players by vote count descending
  const sorted = [...room.players].sort(
    (a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0)
  );

  async function advance() {
    setAdvancing(true);
    await fetch(`/api/rooms/${room.code}/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    setAdvancing(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-5">
        {/* Prompt recap */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Round {room.promptIndex + 1} Result
          </p>
          <p className="text-lg font-bold text-zinc-700">&ldquo;{prompt}&rdquo;</p>
        </div>

        {/* Winner card */}
        {winner && (
          <Card className="border-2 border-violet-200 bg-violet-50">
            <CardContent className="py-6 text-center space-y-3">
              <p className="text-4xl">🏆</p>
              <Avatar name={winner.name} size="lg" className="mx-auto" />
              <div>
                <p className="text-2xl font-black text-zinc-900">{winner.name}</p>
                <Badge variant="accent" className="mt-1">
                  {voteCounts[winner.id]} vote{voteCounts[winner.id] !== 1 ? "s" : ""}
                </Badge>
              </div>
              {winner.id === playerId && (
                <p className="text-sm font-semibold text-violet-600">That&apos;s you! 👀</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vote breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Vote Breakdown</p>
          {sorted.map((player) => {
            const votes = voteCounts[player.id] ?? 0;
            const pct = room.players.length > 0 ? (votes / room.players.length) * 100 : 0;
            return (
              <div key={player.id} className="flex items-center gap-3">
                <Avatar name={player.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-900 truncate">{player.name}</span>
                    <span className="text-sm text-zinc-400 shrink-0 ml-2">{votes}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Host advance button */}
        {isHost ? (
          <Button
            className="w-full"
            variant="accent"
            size="lg"
            onClick={advance}
            disabled={advancing}
          >
            {advancing ? "..." : isLastRound ? "See Final Scores 🏁" : "Next Round →"}
          </Button>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 py-3 text-center text-sm text-zinc-400">
            Waiting for host to continue...
          </div>
        )}
      </div>
    </div>
  );
}
