# Pending Documentation Updates

**Purpose:** This file tracks completed features that need to be incorporated into main documentation (CLAUDE.md, ROADMAP.md, etc.). It is maintained by Claude Code via the `/log-update` slash command.

**Last Updated:** 2025-11-07 (Synced: 1 feature documented and archived)

---

## Instructions for Claude Code

When `/log-update` is run:
1. Read the most recent git commit(s) automatically
2. Analyze what files changed and what code changed
3. Ask user: "What does this feature do for users?" (non-technical description)
4. Determine automatically:
   - Whether validation logic changed (check lib/validations/, lib/utils/check-completeness.ts)
   - Whether architecture changed (new folders, components, data flow patterns)
   - Which documentation files need updating (CLAUDE.md always, others conditionally)
5. Write structured entry below using the template format
6. Use status markers: ✅ COMPLETED, 🚧 IN PROGRESS, ⏸️ BLOCKED

When `/docs-sync` is run:
1. Process all ✅ COMPLETED items
2. Move them to COMPLETED.md with timestamp
3. Clear this file (keep only 🚧 IN PROGRESS and ⏸️ BLOCKED items)

---

## Status Markers

- ✅ **COMPLETED** - Feature is done and working, ready to document
- 🚧 **IN PROGRESS** - Feature partially implemented, provides context for next conversation
- ⏸️ **BLOCKED** - Feature started but blocked by decision/issue, not ready to document

---

## Template for Entries

```markdown
### ✅ [Feature Name] (YYYY-MM-DD)
- **User Impact:** [What can users do now? Non-technical description]
- **Technical Details:**
  - [Main changes, e.g., "Modified supplier-form.tsx (added mode prop)"]
  - [File changes, e.g., "Created lib/utils/session-storage.ts"]
  - [Key technical points]
- **Validation Change:** [YES/NO - if yes, explain what changed]
- **Architecture Change:** [YES/NO - if yes, explain what changed]
- **Commit:** [hash] "[commit message]"
- **Docs to Update:** [List: CLAUDE.md, ROADMAP.md, VALIDATION.md, etc.]
- **Additional Notes:** [Optional: bugs fixed, blockers resolved, etc.]
```

---

## Recent Completions

<!-- Claude Code: Add completed features here via /log-update -->
<!-- These will be processed by /docs-sync and moved to COMPLETED.md -->

*No completed features pending sync.*

---

## In Progress

<!-- Features currently being worked on - provides context for future conversations -->

*No features in progress.*

---

## Blocked

<!-- Features started but blocked by decision/issue -->

*No blocked features.*

---

## Notes for User

- Run `/log-update` after completing each feature (1-2 min)
- Run `/docs-sync` when you have 2-3 completed features (5-10 min weekly)
- You don't need to edit this file manually - Claude maintains it
- If conversation ends mid-feature, 🚧 IN PROGRESS items preserve context

---

**Next Action:** Run `/log-update` after your next feature completion
