# Implementation Plan: iOS Tag-Reader UID Event Mode

**Branch**: `001-ios-tag-uid` | **Date**: 2025-12-22 | **Spec**: [specs/001-ios-tag-uid/spec.md](specs/001-ios-tag-uid/spec.md)
**Input**: Feature specification from `/specs/001-ios-tag-uid/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add an opt-in JS API (`registerTagEventEx`-style) that uses iOS `NFCTagReaderSession`
to emit continuous `NfcManagerDiscoverTag` events containing stable `tag.id` for
ISO14443/ISO15693/ISO7816 tags, while keeping default NDEF `registerTagEvent`
behavior unchanged. Android aliases to existing behavior. Update types, docs, and
examples; ensure tests and on-device validation cover UID emission and NDEF
regression safety.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript/TypeScript surface; Objective-C (iOS), Java (Android); React Native 0.7x+; iOS 13+ Core NFC.  
**Primary Dependencies**: React Native, CoreNFC (iOS), Android NFC APIs.  
**Storage**: N/A (library emits events).  
**Testing**: Jest unit/integration; on-device iOS manual validation (simulator unsupported for NFC).  
**Target Platform**: iOS 13+ (tag reader), Android 5+/API 21+.  
**Project Type**: Mobile library (cross-platform).  
**Performance Goals**: UID emitted within ~1s of tag tap; continuous scanning with restartPolling and no session drops in 10-tag run.  
**Constraints**: Opt-in only; preserve default NDEF path; require NFC entitlements/permissions; avoid breaking payload shapes.  
**Scale/Scope**: Single library change with JS surface + native iOS implementation; Android unchanged.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fork delta control: ✅ Opt-in only via new method; default NDEF untouched; plan to
  document divergence and device-test UID mode.
- API compatibility: ✅ No breaking surface; add new method + types, keep existing
  signatures/behavior.
- Platform parity: ✅ Android unchanged; iOS documented with entitlements and tech
  coverage (ISO14443/15693, felica noted).
- Test-first: ✅ Add failing Jest coverage for JS surface and mocked native path; plan
  on-device checklist for iOS UID mode.
- Documentation sync: ✅ Will update README/usage and index.d.ts concurrently.
- Security and safety: ✅ Sessions remain short-lived per tap with restartPolling;
  permissions/entitlements documented; no sensitive data persisted.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/                      # JS surface and typings
ios/                      # Objective-C implementation (NfcManager.m, categories)
android/                  # Android unchanged
__tests__/                # Jest tests
specs/001-ios-tag-uid/    # Docs for this feature (plan, research, data-model, quickstart, contracts)
```

**Structure Decision**: Mobile library with platform folders at repo root (ios/, android/) and JS surface in src/; tests in __tests__.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
