# Tasks: iOS Tag-Reader UID Event Mode

**Input**: Design documents from `/specs/001-ios-tag-uid/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for new NFC behaviors and handler changes; include unit
and integration coverage per the constitution. Cover the iOS tag-reader UID event mode
when changes touch that path. Extend scope if the feature specification asks for more.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure local environment is ready for native + JS changes

- [x] T001 Install project dependencies in package root (package.json)
- [x] T002 [P] Install iOS pods to ensure native build readiness in ios/Podfile

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish baseline and guardrails before story work

- [x] T003 Run baseline Jest suite to confirm clean state before changes (package.json scripts)
- [x] T004 [P] Record device/entitlement notes for upcoming iOS manual tests in specs/001-ios-tag-uid/quickstart.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Continuous iOS tag scan emits UID (Priority: P1) 🎯 MVP

**Goal**: Opt-in iOS tag-reader event mode emits stable `tag.id` while session stays active
**Independent Test**: Start `registerTagEventEx`, tap two ISO14443/ISO15693 tags, observe two events with distinct `id` and active session

### Tests for User Story 1 (write first)

- [x] T005 [P] [US1] Add Jest coverage for JS export/bridge of registerTagEventEx in **tests**/NfcManagerIOS.test.js
- [x] T006 [P] [US1] Add Jest coverage asserting DiscoverTag emits `id` when registerTagEventEx is invoked (mock native emit) in **tests**/NfcManagerIOS.test.js

### Implementation for User Story 1

- [x] T007 [US1] Implement registerTagEventEx JS surface and export in src/NativeNfcManager.js, src/NfcManager.js, and src/index.js
- [x] T008 [US1] Update type definitions for registerTagEventEx options and payload (`id`, `tech`, `idm`, `systemCode`) in index.d.ts
- [x] T009 [US1] Implement iOS NFCTagReaderSession event mode with restartPolling and DiscoverTag emission in ios/NfcManager.m (and header if required)
- [x] T010 [P] [US1] Alias registerTagEventEx to existing behavior on Android while keeping defaults unchanged in src/NfcManagerAndroid.js
- [x] T011 [P] [US1] Update feature quickstart with on-device test checklist for UID mode in specs/001-ios-tag-uid/quickstart.md

**Checkpoint**: User Story 1 independently delivers UID events on iOS with opt-in API

---

## Phase 4: User Story 2 - Default NDEF flow remains unchanged (Priority: P2)

**Goal**: Preserve existing NDEF event behavior on iOS/Android when not opting in
**Independent Test**: Run default registerTagEvent; payload matches pre-fork (no `id`), lifecycle unchanged

### Tests for User Story 2 (write first)

- [x] T012 [P] [US2] Add Jest regression ensuring default registerTagEvent payload omits `id` on iOS and matches prior shape in **tests**/NfcManager.test.js
- [x] T013 [P] [US2] Add Jest regression confirming Android registerTagEvent path unchanged when using new API alias in **tests**/NfcManagerAndroid.test.js

### Implementation for User Story 2

- [x] T014 [US2] Guard JS surface to keep default registerTagEvent NDEF behavior untouched (no UID) in src/NfcManager.js

**Checkpoint**: User Story 2 confirms defaults and Android compatibility are intact

---

## Phase 5: User Story 3 - Developers know how to enable UID mode (Priority: P3)

**Goal**: Provide discoverable docs/examples so developers can enable opt-in mode safely
**Independent Test**: Follow docs and typings to enable mode; build passes; events deliver UID on device

### Implementation for User Story 3

- [x] T015 [P] [US3] Add README usage section showing registerTagEventEx and noting defaults remain unchanged in README.md
- [x] T016 [P] [US3] Add changelog entry describing opt-in UID mode and default NDEF behavior in CHANGELOG.md
- [x] T017 [US3] Add inline JSDoc/comments for registerTagEventEx usage and options in src/NativeNfcManager.js
- [x] T017a [US3] Create integration handoff doc for the phone app (location: phone_app_readme.md or companion file) covering how to switch to registerTagEventEx, required entitlements, event handling, dedupe on tag.id, and Android parity expectations

**Checkpoint**: User Story 3 equips developers to adopt the new API without regressions

---

## Phase 6: Polish & Cross-Cutting

- [x] T018 [P] Run full test suite and lint after changes (package.json scripts)
- [X] T019 Verify manual iOS device checklist (10-tag run, repeat-tag dedupe, session close) and capture results in specs/001-ios-tag-uid/quickstart.md

---

## Dependencies & Execution Order

- Setup → Foundational → User Story 1 (MVP) → User Story 2 → User Story 3 → Polish
- User Story 1 is prerequisite for stories 2 & 3 (API must exist before regression/docs)

## Parallel Execution Examples

- US1 tests in parallel: T005, T006
- US1 implementation in parallel after tests: T007, T008, T010, T011 (T009 serialized for native)
- US2 tests in parallel: T012, T013
- US3 docs in parallel: T015, T016
- Polish tasks in parallel: T018, T019

## Implementation Strategy

- MVP first: complete Setup → Foundational → US1; validate UID events on-device.
- Incremental: add US2 regression guards, then US3 documentation/communication.
- Finish with Polish: full test run and manual device checklist captured.
