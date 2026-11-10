"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent, deleteEvent, updateEvent } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { KINDS, type EventKind, type EventRow } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";

export function EventFormDialog({ event }: { event?: EventRow }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  function submit(fd: FormData) {
    setError(null);
    start(async () => {
      try {
        if (event) {
          await updateEvent(fd);
          setOpen(false);
        } else {
          const id = await createEvent(fd);
          setOpen(false);
          router.push(`/udalosti/${id}`);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {event ? (
          <Button size="sm" variant="outline" className="bg-card">
            <Pencil /> Upraviť
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Nová udalosť
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle className="font-serif text-lg">{event ? "Upraviť udalosť" : "Nová udalosť"}</DialogTitle>
        <form action={submit} className="space-y-4">
          {event && <input type="hidden" name="id" value={event.id} />}
          <div className="grid grid-cols-[1fr_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Dátum</Label>
              <Input id="ev-date" name="date" type="date" required defaultValue={event?.date ?? today} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-kind">Typ</Label>
              <select
                id="ev-kind"
                name="kind"
                defaultValue={event?.kind ?? "nazivo"}
                className="border-input h-9 w-full rounded-md border bg-transparent px-2 text-base md:text-sm"
              >
                {(Object.keys(KINDS) as EventKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KINDS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Názov</Label>
            <Input id="ev-title" name="title" required defaultValue={event?.title} placeholder="napr. Beseda v Trenčianskych Tepliciach" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-place">Miesto / médium</Label>
            <Input id="ev-place" name="place" defaultValue={event?.place ?? ""} placeholder="napr. Kino Trenčianske Teplice · RTVS · Denník N" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-url">Odkaz</Label>
            <Input id="ev-url" name="url" defaultValue={event?.url ?? ""} placeholder="článok, reportáž, FB event…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Popis</Label>
            <Textarea id="ev-desc" name="description" defaultValue={event?.description ?? ""} className="min-h-28" placeholder="Čo sa dialo, kto bol, text, ktorý môžu správcovia FB použiť…" />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            {event ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                disabled={pending}
                onClick={() => {
                  if (!confirm(`Zmazať udalosť „${event.title}“ aj so všetkými fotkami a videami?`)) return;
                  start(async () => {
                    await deleteEvent(event.id);
                    router.push("/");
                  });
                }}
              >
                <Trash2 /> Zmazať
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Ukladám…" : event ? "Uložiť" : "Vytvoriť"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
