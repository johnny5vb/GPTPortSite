---
type: daily
date: {{date:YYYY-MM-DD}}
---
# {{date:dddd, MMMM Do YYYY}}

← [[{{date-1d:YYYY-MM-DD}}]] | [[{{date+1d:YYYY-MM-DD}}]] →

## Focus
*The one thing that makes today count.*
- 

## Log
*What actually happened. Timestamped if useful.*
- 

## Captured
*Raw. Don't file it, don't judge it. Weekly review sorts this out.*
- 

## Open loops
```dataview
TASK
WHERE !completed AND !contains(file.folder, "99 Archive") AND !contains(file.folder, "04 Daily")
GROUP BY file.link
```
