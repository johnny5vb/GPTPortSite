---
type: dashboard
cssclasses:
  - dashboard
---
# Dashboard

> [!tip] Bookmark this note (`Cmd/Ctrl+O` → Dashboard) and make it your home base.
> Every block below is a live [[Dataview]] query — nothing here is maintained by hand.

---

## 📥 Inbox — needs a decision

*Delete it, file it, or promote it. Empty this weekly.*

```dataview
TABLE WITHOUT ID file.link AS "Note", file.ctime AS "Captured"
FROM "00 Inbox"
SORT file.ctime ASC
```

---

## 🎯 Active projects

```dataview
TABLE WITHOUT ID file.link AS "Project", client AS "Client", due AS "Due", status AS "Status"
FROM "02 Projects"
WHERE status = "active"
SORT due ASC
```

## ⚠️ Stalled projects

*An active project with no open task is stalled. Give it a next action or archive it.*

```dataview
LIST
FROM "02 Projects"
WHERE status = "active" AND length(filter(file.tasks, (t) => !t.completed)) = 0
```

---

## ✅ Open actions

```dataview
TASK
WHERE !completed
  AND !contains(file.folder, "99 Archive")
  AND !contains(file.folder, "_Templates")
GROUP BY file.link
```

---

## 🌱 Seeds to develop

*Notes you started but never finished thinking about. Oldest first — pick one a week.*

```dataview
TABLE WITHOUT ID file.link AS "Note", file.ctime AS "Planted"
FROM "01 Notes"
WHERE status = "seed"
SORT file.ctime ASC
LIMIT 12
```

## 🔗 Orphans

*Notes with no links in or out. Either connect them or delete them — an unlinked note is a note you'll never find again.*

```dataview
LIST
FROM "01 Notes"
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
```

---

## 📚 Sources waiting to be mined

```dataview
TABLE WITHOUT ID file.link AS "Source", author AS "Author", format AS "Format"
FROM "03 Sources"
WHERE status = "unprocessed"
SORT file.ctime DESC
```

---

## 🕐 Touched this week

```dataview
TABLE WITHOUT ID file.link AS "Note", file.mtime AS "Edited"
FROM "01 Notes" OR "02 Projects" OR "03 Sources"
WHERE file.mtime >= date(today) - dur(7 days)
SORT file.mtime DESC
LIMIT 15
```

---

## 🗺️ Maps of Content

```dataview
LIST
FROM "01 Notes"
WHERE type = "moc"
SORT file.name ASC
```
