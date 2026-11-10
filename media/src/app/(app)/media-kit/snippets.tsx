"use client";

import { useState, useTransition } from "react";
import type { Snippet } from "@/lib/types";
import { deleteSnippet, saveSnippet } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Pencil, Plus, Trash2 } from "lucide-react";

function Editor({ s, onDone }: { s?: Snippet; onDone: () => void }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) =>
        start(async () => {
          await saveSnippet(fd);
          onDone();
        })
      }
      className="bg-card space-y-2 rounded-lg border p-3"
    >
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="flex gap-2">
        <Input name="title" defaultValue={s?.title} placeholder="Názov, napr. Post k besede (SK)" required />
        <select name="lang" defaultValue={s?.lang ?? "sk"} className="border-input h-9 rounded-md border bg-transparent px-2 text-base md:text-sm">
          <option value="sk">SK</option>
          <option value="cz">CZ</option>
          <option value="en">EN</option>
        </select>
      </div>
      <Textarea name="body" defaultValue={s?.body} className="min-h-40" placeholder="Text postu…" required />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Zrušiť
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Ukladám…" : "Uložiť"}
        </Button>
      </div>
    </form>
  );
}

export function Snippets({ snippets }: { snippets: Snippet[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [, start] = useTransition();

  return (
    <div className="space-y-3">
      {snippets.map((s) =>
        editing === s.id ? (
          <Editor key={s.id} s={s} onDone={() => setEditing(null)} />
        ) : (
          <article key={s.id} className="bg-card group rounded-lg border p-3 md:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                {s.title}
                <span className="bg-secondary rounded px-1.5 py-0.5 text-[10px] uppercase">{s.lang}</span>
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" title="Upraviť" onClick={() => setEditing(s.id)}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Zmazať"
                  className="hover:text-destructive"
                  onClick={() => confirm(`Zmazať text „${s.title}“?`) && start(() => deleteSnippet(s.id))}
                >
                  <Trash2 />
                </Button>
                <CopyButton text={s.body} label="Kopírovať text" />
              </div>
            </div>
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{s.body}</p>
          </article>
        )
      )}
      {editing === "new" ? (
        <Editor onDone={() => setEditing(null)} />
      ) : (
        <Button variant="outline" size="sm" className="bg-card" onClick={() => setEditing("new")}>
          <Plus /> Pridať text
        </Button>
      )}
    </div>
  );
}
