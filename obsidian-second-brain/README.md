# Second Brain

An Obsidian vault built to survive contact with a real week.

The structure here is deliberately small. Folders answer *where does this live*;
links answer *how does this relate*. If you find yourself wanting a new folder,
you probably want a [Map of Content](<01 Notes/Second Brain MOC.md>) instead.

---

## Setup (10 minutes, once)

**1. Open the vault**
Obsidian → *Open folder as vault* → select this `obsidian-second-brain` folder.
Trust the vault when prompted (it needs to be trusted to load plugins).

**2. Install the five plugins**
Settings → Community plugins → *Turn on community plugins* → Browse, then install
and enable:

| Plugin | What it buys you |
| --- | --- |
| **Dataview** | Makes `Dashboard.md` work. Non-negotiable — half this vault is dataview queries. |
| **Templater** | Optional but good: adds prompts and logic on top of the built-in templates. |
| **Omnisearch** | Search that actually finds things, including inside PDFs. |
| **Calendar** | Click a date, jump to that daily note. |
| **Obsidian Git** | Auto-commits the vault on a timer. Your backup. |

Everything else is already configured — attachment folder, daily notes,
templates folder, and hotkeys ship in `.obsidian/`.

**3. Set up backup on day one**
A second brain you can lose isn't one. Either:
- **Obsidian Sync** (~$4/mo, cleanest mobile experience), or
- **Obsidian Git** → point it at a *private* repo, auto-commit every 10 minutes.

Do this before you put anything real in here.

**4. Learn three shortcuts and stop**
- `Cmd/Ctrl + O` — Quick switcher (jump to any note)
- `Cmd/Ctrl + Shift + D` — Today's daily note
- `Cmd/Ctrl + Shift + F` — Search everything

---

## The structure

```
00 Inbox/       Everything lands here first, unsorted. Emptied weekly.
01 Notes/       Evergreen atomic notes. One idea per note. The actual brain.
02 Projects/    Active work. One note per project.
03 Sources/     Books, articles, talks — things other people made.
04 Daily/       Daily notes. Your capture surface.
05 People/      Who you know, what they care about, what's open with them.
99 Archive/     Done, dead, or cold. Never delete — archive.
_Templates/     Note templates.
_Attachments/   Images and files. Obsidian puts them here automatically.
```

The numbers exist only to force a useful sort order in the file explorer.

---

## The three rules

**1. Capture and organize are separate jobs.**
The failure mode of every second brain is trying to file things at the moment
of capture. Don't. Everything goes to `00 Inbox` or today's daily note with
zero ceremony. Sorting happens once a week, on purpose.

**2. One note = one idea, and the title states the idea.**

- ❌ `AI tools` — that's a topic, and topics grow into junk drawers
- ✅ `AI collapses the cost of the first draft, not the last`

Titles-as-claims are what make links mean something. `[[AI collapses the cost
of the first draft, not the last]]` reads as an *argument* inside another note.
`[[AI tools]]` reads as a filing label.

**3. Link aggressively, tag sparingly.**
Tags are for *status* — `#seed`, `#permanent`, `#todo`. Subjects should be
links, not tags. Every time you write a note, ask what it connects to, and
link it. Then check the **Unlinked mentions** section at the bottom of the
backlinks pane — it finds connections you didn't make on purpose.

---

## The ritual

This is the whole system. Everything above is scaffolding.

| When | How long | What |
| --- | --- | --- |
| **Daily** | 2 min | Open the daily note. Dump everything into `Captured`. Don't organize. |
| **Weekly** | 20 min | Run [[Weekly Review]]. Empty the Inbox. Promote one seed. |
| **Monthly** | 30 min | Open your MOCs. Prune dead links. Archive finished projects. |

If you only ever do the weekly review, this works. If you do everything else
and skip it, this becomes a junk drawer with good typography.

---

## Note lifecycle

```
Daily note capture  →  00 Inbox  →  01 Notes (status: seed)  →  01 Notes (status: permanent)
     raw thought        parked         written up                  linked, edged, done
```

A note earns `status: permanent` when it has: a one-sentence claim, at least
one reason it holds, at least one place it breaks, and two real links out.

Most captures never make it past the Inbox. **That is the system working**, not
failing — the filter is the point.

---

## Where to start

1. Open `Dashboard.md` and bookmark it.
2. Read the three seed notes in `01 Notes/` — they demonstrate the format.
3. Press `Cmd/Ctrl + Shift + D` and write down what's in your head right now.

Don't build structure ahead of content. Capture for two weeks, then let the
weekly review tell you what shape this vault actually needs.
