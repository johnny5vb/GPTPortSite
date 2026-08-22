---
type: review
week: "{{date:gggg-[W]ww}}"
date: {{date:YYYY-MM-DD}}
---
# Weekly Review — {{date:gggg}} week {{date:ww}}

> [!tip] 20 minutes, once a week. This is the system. Everything else is optional.

## 1. Empty the Inbox
For each item: **delete it**, **file it**, or **promote it** into an atomic note.
Deleting most of it is the correct outcome.

```dataview
TABLE file.ctime AS "Captured"
FROM "00 Inbox"
SORT file.ctime ASC
```

## 2. Sweep the daily notes
Anything in this week's `Captured` sections worth keeping?

```dataview
LIST
FROM "04 Daily"
WHERE file.day >= date(today) - dur(7 days)
SORT file.day DESC
```

## 3. Develop one seed
Pick a single `#seed` note and push it toward `status: permanent`.

```dataview
LIST
FROM "01 Notes"
WHERE status = "seed"
SORT file.ctime ASC
LIMIT 10
```

## 4. Check the projects
Any project without a next action is stalled.

```dataview
TABLE status, due
FROM "02 Projects"
WHERE status = "active"
SORT due ASC
```

## 5. Close the loop
- What went well:
- What I'm dropping:
- Next week's one thing:
