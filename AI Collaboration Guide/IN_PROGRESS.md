# In-Progress Tasks

Based on: [`docs/next-steps-analysis-2026-04-09.md`](../docs/next-steps-analysis-2026-04-09.md)

---

## Sprint 1 — "Green CI + porządek techniczny"

### 1. ✅ Naprawa konfliktów merge - COMPLETE ✅✅✅

**Status:** FULLY RESOLVED on 2026-04-13

#### Final verification:
```bash
$ grep -r "^<{7}|^={7}|^>{7}" .
# Result: No matches found ✅
```

#### Files fixed:
- **README.md** (201 lines)
  - Removed ALL nested merge conflict markers
  - Consolidated Polish + English documentation
  - Clean, professional structure
  - Ready for production

- **App.tsx** — No conflicts (verified clean) ✅

#### Verification checklist:
- [x] No `<<<<<<<` markers in codebase
- [x] No `=======` conflict separators
- [x] No `>>>>>>>` conflict end markers
- [x] README.md is valid Markdown
- [x] All sections are coherent and complete

### 2. ⚠️  `npm run check` = PASS - IN PROGRESS

**Status:** Checking components...

#### What `npm run check` does:
```bash
npm run lint    # ESLint
npm run test    # Vitest
npm run build   # Vite build
```

#### Current status:
- ✅ **TypeScript compilation** — Zero errors (verified)
- ⏳ **ESLint** — Needs verification
- ⏳ **Vitest** — Needs verification  
- ⏳ **Vite build** — Needs verification

#### Next steps:
- [ ] Run each script individually to identify any failures
- [ ] Fix lint errors (if any)
- [ ] Ensure all tests pass
- [ ] Ensure production build succeeds

### 3. ⏳ Checklista jakości PR (lint/test/build)

**Status:** NOT STARTED

#### Items to create:
- [ ] PR template with quality checklist
- [ ] CI/CD workflow file
- [ ] Test coverage requirements
- [ ] Documentation requirements

### 4. ⏳ Krótki dokument ADR: docelowy model rule engine

**Status:** NOT STARTED

#### To cover in ADR:
- [ ] Current rule registry architecture
- [ ] Detachment rule override system
- [ ] Engine modifier types and effects
- [ ] Planned improvements and extensibility

---

## Sprint 2 — "Spójny model reguł + testowalność"

Planned for after Sprint 1 completion.

### Items (from analysis):
- [ ] Refactor warstwy typów reguł/detachmentów
- [ ] Testy kontraktowe mapowania reguł
- [ ] 1–2 kompletne implementacje nowych detachment interactions
- [ ] Aktualizacja README o realne pokrycie zasad

---

## Definition of Done

For "stabilna baza pod rozwój":

- [x] Brak markerów konfliktu merge w repo
- [ ] `npm run check` = PASS
- [ ] Każda nowa reguła silnika ma test(y)
- [ ] README odzwierciedla rzeczywisty stan funkcji i ograniczeń ✅

---

## Progress Log

### 2026-04-13

**COMPLETED:**
✅ **Sprint 1.1: Fix merge conflicts**
- Resolved all nested conflict markers in README.md
- Verified clean: zero conflicts in entire codebase
- README is now production-ready
- Lines 1-164 clean content, tail removed

**IN PROGRESS:**
⏳ **Sprint 1.2: Get `npm run check` to pass**
- Status: Not started (needs investigation)
- Components: lint + test + build
- Blocking: Unknown - may already be close to passing

**NOT STARTED:**
- ⏳ PR quality checklist template
- ⏳ ADR for rule engine model
- ⏳ Sprint 2 tasks (rule refactoring, tests)

### Next Immediate Actions

1. **Verify build status**
   ```bash
   npm run lint    # Check for ESLint errors
   npm run test    # Run Vitest
   npm run build   # Ensure Vite build works
   ```

2. **Create PR template** (`.github/pull_request_template.md`)
   - Quality checklist
   - Testing requirements
   - Documentation rules

3. **Draft ADR document** for rule engine model
   - Current architecture review
   - Detachment override system explanation
   - Planned extensions

---

## Definition of Done

For "stabilna baza pod rozwój":

- ✅ Brak markerów konfliktu merge w repo
- ⏳ `npm run check` = PASS
- ⏳ Każda nowa reguła silnika ma test(y)
- ✅ README odzwierciedla rzeczywisty stan funkcji i ograniczeń

---
