"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Room } from "@/lib/rooms";

interface FinalScreenProps {
  room: Room;
  playerId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function FinalScreen({ room, playerId }: FinalScreenProps) {
  const router = useRouter();

  const sorted = [...room.players].sort(
    (a, b) => (room.scores[b.id] ?? 0) - (room.scores[a.id] ?? 0)
  );
  const topScore = room.scores[sorted[0]?.id] ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-10">
      <div className="mx-auto w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🎉</div>
          <h1 className="text-3xl font-black text-zinc-900">Final Scores</h1>
          <p className="text-zinc-500 text-sm">Who&apos;s the most predictable? You decide.</p>
        </div>

        {/* Winner spotlight */}
        {sorted[0] && topScore > 0 && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="py-5 text-center space-y-2">
              <p className="text-3xl">👑</p>
              <Avatar name={sorted[0].name} size="lg" className="mx-auto" />
              <p className="text-xl font-black text-zinc-900">{sorted[0].name}</p>
              <p className="text-sm text-zinc-600">
                Won {topScore} round{topScore !== 1 ? "s" : ""} — the most likely one
              </p>
              {sorted[0].id === playerId && (
                <Badge variant="accent">That&apos;s you! 🎯</Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Full leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sorted.map((player, idx) => {
              const score = room.scores[player.id] ?? 0;
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5"
                >
                  <span className="text-xl w-7 text-center shrink-0">
                    {MEDALS[idx] ?? "🔸"}
                  </span>
                  <Avatar name={player.name} size="sm" />
                  <span className="flex-1 font-medium text-zinc-900">{player.name}</span>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-zinc-900">{score}</span>
                    <span className="text-xs text-zinc-400 ml-1">win{score !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Play again */}
        <Button
          className="w-full"
          variant="accent"
          size="lg"
          onClick={() => router.push("/")}
        >
          Play Again 🔄
        </Button>
      </div>
    </div>
  );
}
