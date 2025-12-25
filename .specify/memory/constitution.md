# Keyhive React Native NFC Manager Constitution

<!-- Sync Impact Report
- Version: 1.0.0 -> 1.1.0
- Modified principles: Principle 1 renamed to Upstream Alignment & API Stability; Principle 4
  expanded for fork docs/examples
- Added sections: Fork Purpose & Scope
- Removed sections: none
- Templates requiring updates: /.specify/templates/plan-template.md ✅ updated; /.specify/templates/spec-template.md ⚠ not required; /.specify/templates/tasks-template.md ✅ updated; commands templates ⚠ directory not present
- Follow-up TODOs: none
-->

## Core Principles

### Principle 1: Upstream Alignment & API Stability
Fork changes MUST stay minimal and compatible with upstream `react-native-nfc-manager`.
Public APIs, event payloads, and data contracts MUST remain backward compatible across
minor releases. Breaking changes require a deprecation plan, migration notes, and a
major-version release. Any divergence from upstream MUST be documented with rationale
and, where possible, upstreamed.

### Principle 2: Platform Parity & Native Compliance
Features MUST be evaluated for both iOS and Android. When parity is impossible, the
gap and rationale MUST be documented with platform-specific behavior, entitlements,
and permissions. Native capabilities (e.g., Core NFC, Android PendingIntent limits)
MUST be respected and kept current.

### Principle 3: Test-First Coverage for NFC Flows
Tests MUST precede implementation for new NFC behaviors, ensuring red-green-refactor.
Coverage MUST include unit tests for utilities/parsers and integration tests for tech
requests, tag interactions, and platform-specific handlers. Regressions require
reproduction tests before fixes.

### Principle 4: Documentation & Examples Fidelity
README, type definitions, and sample code MUST match shipped behavior and clearly call
out fork-specific capabilities (e.g., iOS tag-reader UID event mode) and defaults.
Each new feature or platform nuance requires an example or snippet plus setup guidance
(entitlements, permissions). Deprecations MUST be called out in docs and examples
concurrently.

### Principle 5: Security, Privacy, and Safety
NFC operations MUST declare required permissions, minimize tag/session lifetime, and
avoid persisting sensitive tag data. Error handling MUST fail safe (cancel sessions,
release tech) and surface actionable messages. Security-related changes demand explicit
review and changelog notes.

## Fork Purpose & Scope

- Forked from https://github.com/revtel/react-native-nfc-manager for the Keyhive phone
  app to provide continuous iOS tag-reader event mode that emits stable `tag.id` for
  MiFare/ISO15693/ISO7816 while keeping default NDEF behavior unchanged.
- Android behavior stays aligned with upstream; no intentional Android divergences.
- Tag-reader UID mode remains opt-in; default registration preserves NDEF flow.
- Documentation MUST describe the fork delta, intended app usage, and migration notes
  when syncing with upstream.

## Quality Gates

Pull requests MUST satisfy:
- API compatibility check: no breaking surface changes without a migration path and
  semver-major labeling.
- Platform review: confirm iOS/Android parity notes and required entitlements/
  permissions are updated.
- Test enforcement: new behaviors require failing tests first and passing suites for
  unit, integration, and tech-handler coverage.
- Documentation sync: README/types/examples updated alongside code changes.
- Security posture: permission scopes justified, sessions cleaned up, and sensitive
  data avoided or scrubbed.
- Fork delta control: document any divergence from upstream, keep NDEF defaults intact,
  and ensure iOS tag-reader UID event mode remains opt-in and tested on devices.

## Development Workflow

- Plan: scope changes with platform impact, API surfaces, and required entitlements.
- Implement: follow test-first; keep handlers consistent across platforms; prefer
  non-breaking extensions.
- Review: enforce Quality Gates; require platform-specific reviewers for native code
  and confirm fork deltas are intentional and documented.
- Release: follow semver; document platform gaps and migration steps in changelog;
  tag releases with supported React Native and platform versions.

## Governance

- This constitution supersedes conflicting guidelines for this repository.
- Amendments: require proposal linked to PR, description of intent, impact analysis,
  and updated version line. Approval by maintainers with platform coverage.
- Versioning: semantic versioning for the constitution; major for principle changes,
  minor for new guidance, patch for clarifications.
- Compliance: reviewers verify Quality Gates and principles on every PR. Deviations
  require explicit justification and tracking until resolved.

**Version**: 1.1.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
