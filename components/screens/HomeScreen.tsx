"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("playerName") ?? "" : ""
  );
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("join");
    if (code) {
      setJoinCode(code.toUpperCase());
      setMode("join");
    }
  }, [searchParams]);

  function saveName(n: string) {
    setName(n);
    if (typeof window !== "undefined") localStorage.setItem("playerName", n);
  }

  async function createRoom() {
    if (!name.trim()) return setError("Enter your name first!");
    setLoading(true);
    setError("");
    try {
      const playerId = getOrCreatePlayerId();
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim(), hostId: playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${data.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    if (!name.trim()) return setError("Enter your name first!");
    if (!joinCode.trim()) return setError("Enter a room code!");
    setLoading(true);
    setError("");
    try {
      const playerId = getOrCreatePlayerId();
      const code = joinCode.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🎯</div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Most Likely To</h1>
          <p className="text-zinc-500 text-sm">The chaotic party game for people who know each other too well</p>
        </div>

        {/* Name input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What&apos;s your name?</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => saveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (mode === "join" ? joinRoom() : createRoom())}
              maxLength={20}
              autoComplete="off"
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-center text-sm font-medium text-red-500">{error}</p>
        )}

        {/* Action buttons */}
        {mode === "idle" ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              variant="accent"
              size="lg"
              onClick={createRoom}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => setMode("join")}
            >
              Join Room
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Room code (e.g. BXQZ)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              maxLength={4}
              className="text-center text-2xl tracking-widest font-mono uppercase"
              autoComplete="off"
            />
            <Button
              className="w-full"
              variant="accent"
              size="lg"
              onClick={joinRoom}
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Room"}
            </Button>
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => { setMode("idle"); setError(""); }}
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
