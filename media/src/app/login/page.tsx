"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { USERS } from "@/lib/username";
import { signIn, type AuthState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const [user, setUser] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [next, setNext] = useState("");
  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get("next") ?? "");
  }, []);

  function pick(name: string) {
    setUser(name);
    requestAnimationFrame(() => passwordRef.current?.focus());
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-8">
        <div className="space-y-3 text-center">
          <Image
            src="/logo-letka.png"
            alt=""
            width={617}
            height={526}
            className="mx-auto h-16 w-auto"
            priority
          />
          <div>
            <p className="font-serif text-2xl font-bold">Posledný zostrel</p>
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Media hub</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="username" value={user ?? ""} />
          <input type="hidden" name="next" value={next} />

          <div className="grid grid-cols-3 gap-2">
            {USERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => pick(name)}
                className={cn(
                  "bg-card h-14 cursor-pointer rounded-lg border text-lg font-semibold tracking-wide transition-colors",
                  user === name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent"
                )}
              >
                {name}
              </button>
            ))}
          </div>

          <div className={cn("space-y-4 transition-opacity", !user && "pointer-events-none opacity-30")}>
            <Input
              ref={passwordRef}
              name="password"
              type="password"
              placeholder="Heslo"
              autoComplete="current-password"
              aria-label="Heslo"
              className="bg-card h-11 text-center"
              disabled={!user}
              required
            />
            <Button type="submit" className="h-11 w-full" disabled={!user || pending}>
              {pending ? "…" : "Vstúpiť"}
            </Button>
          </div>

          {state.error && (
            <p className="text-destructive text-center text-sm">{state.error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
