---
type: moc
status: permanent
created: 2026-08-22
tags:
  - moc
---
# Second Brain MOC

A Map of Content is a hand-curated note whose whole job is to be a doorway.
It replaces the folder you were about to create. Annotate the links — the
one-line "why you'd read this" is what makes a MOC better than a directory
listing.

## How this vault works
- [[Capture and organize are separate jobs]] — why the Inbox exists and why you shouldn't file at capture time
- [[The weekly review is the only load-bearing habit]] — the one habit that keeps the rest honest

## How to write notes
- [[A note title should state a claim, not a topic]] — the highest-leverage formatting rule here
- [[Links carry meaning that folders cannot]] — folders for lifecycle, links for meaning

## Everything tagged #method
```dataview
LIST
FROM #method
WHERE file.name != this.file.name
SORT file.name ASC
```

---

> [!note] Start your own
> When a subject in `01 Notes` reaches ~5 notes, make it a MOC: new note,
> `type: moc` in the frontmatter, and a curated list of links with one line of
> context each. It'll show up automatically in the Dashboard's MOC list.
