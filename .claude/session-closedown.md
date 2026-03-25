# Universal Harmonix — Session Closedown
# Extends: /home/rodent/leanspirited-standards/protocols/session-closedown.md

---

## Mandatory sequence (run before ending any session)

### Step 1: Pipeline check
Is the app opening cleanly in a browser? No JS errors in console?
If not: fix or park with a blocked backlog item. Do not close dirty.

### Step 2: Backlog update
For every item touched: update status in `docs/backlog.md`.
Add any new items surfaced during the session.

### Step 3: ADR session summary
List every ADR written this session.
Confirm `docs/decisions/` index is current.
Flag any verbal decisions not yet written.

### Step 4: HDD advancement check

Answer before closing:
1. Did this session advance HDD-001 (verification step delivers signal)?
2. If yes — what moved? (James tested a sighting, API returned meaningful data, etc.)
3. If no — what was the reason?
4. What is the next concrete validation action?
5. Who owns it and by when?

### Step 5: Decisions log
List significant decisions not captured in ADRs.
Format: `DECISION [date]: [what] — [why]`

### Step 6: SWOT update
If session produced strategic learning (James feedback, API discovery, competitor):
- Note which quadrant(s) affected
- Update SWOT or create delta SWOT in `docs/swot/`

### Step 7: Next session setup
Top 3 items for next session, in priority order.
Session goal in one sentence.
Blockers that need resolving.

### Step 8: Write shared session state
Write `.claude/shared-session-state.md`:
- What was done this session
- HDD-001 status and evidence
- Open questions updated
- Top 3 for next session

### Step 8b: Update session-ref.md (Claude.ai handoff)
Update `.claude/session-ref.md` with current project state.
Also write `uh-status-[date].md` to `/mnt/c/Users/roden/Downloads/` as a ready-to-upload copy.

**Claude.ai cannot read files automatically — Rod must upload manually.**
The mechanism is Claude.ai Project Knowledge:
- Rod drags `uh-status-[date].md` into the UH Claude.ai Project Knowledge after closedown
- It then persists across all Claude.ai conversations in that project
- Without this step, Claude.ai has no project context next session

### Step 9: Commit reminder
Files to commit:
- `app/index.html` (if changed)
- `docs/backlog.md`
- `docs/open-questions.md`
- New ADRs in `docs/decisions/`
- New/updated SWOTs in `docs/swot/`
- `.claude/shared-session-state.md`
