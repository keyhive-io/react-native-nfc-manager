# Feature Specification: iOS Tag-Reader UID Event Mode

**Feature Branch**: `001-ios-tag-uid`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "Implement the feature documented in nfc-ios-uid-fork-spec.md (iOS tag-reader UID event mode for Keyhive phone app)"

## Clarifications

### Session 2025-12-22
- Q: Should the opt-in API be a new method or a flag on existing `registerTagEvent`? → A: Add a new opt-in method (e.g., `registerTagEventEx`) using iOS tag-reader event mode; Android can alias to existing behavior.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Continuous iOS tag scan emits UID (Priority: P1)

App operators can start continuous NFC scanning on iOS and receive events that include
stable tag identifiers so they can resolve keys in the Keyhive backend without manual
retries.

**Why this priority**: Enables the core business flow (key lookup by UID) that is
currently blocked on iOS due to missing tag.id in event mode.

**Independent Test**: Start the opt-in tag-reader event mode on iOS, tap two different
supported tags in sequence, and observe two emitted events with distinct `id` values
while the session remains active.

**Acceptance Scenarios**:

1. **Given** the app starts tag-reader event mode, **When** a supported tag is tapped,
  **Then** the emitted event includes `id` populated from the tag UID.
2. **Given** the session is still active after the first tag, **When** a second tag is
  tapped, **Then** a second event is emitted with a different `id` and the session is
  still active for further scans.

---

### User Story 2 - Default NDEF flow remains unchanged (Priority: P2)

Existing consumers of `registerTagEvent` keep current behavior with NDEF-based
sessions and no UID emission unless they explicitly opt into the new mode.

**Why this priority**: Prevents regressions for upstream-aligned apps and ensures the
fork remains drop-in compatible unless the new mode is chosen.

**Independent Test**: Run the existing NDEF tag event registration path on iOS and
verify payloads and lifecycle match pre-fork behavior (no `id`, no tech reader changes).

**Acceptance Scenarios**:

1. **Given** an app uses the default `registerTagEvent`, **When** a tag is read, **Then**
  the payload matches prior NDEF event structure without `id` and the session
  lifecycle (start/close) is unchanged.
2. **Given** the forked package installed, **When** Android uses existing flows,
  **Then** behavior and payloads are unchanged.

---

### User Story 3 - Developers know how to enable UID mode (Priority: P3)

Developers integrating the Keyhive phone app can discover, type-check, and follow a
documented example to enable the opt-in iOS tag-reader UID event mode safely.

**Why this priority**: Clear guidance reduces misuse risk and speeds adoption without
platform-specific guesswork.

**Independent Test**: Follow the documented example and type definitions to enable the
mode; build succeeds and runtime events include UID as described.

**Acceptance Scenarios**:

1. **Given** a developer reads the updated docs and typings, **When** they call the
  opt-in registration API with the documented options, **Then** the code type-checks
  and emits events with UID on device.
2. **Given** the developer wants defaults, **When** they omit the new API/flag,
  **Then** the build and runtime behavior stay unchanged.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Tag connect failure during event mode should restart polling without crashing and
  emit a session-closed event only on fatal invalidate.
- Same tag tapped repeatedly should emit identical `id` values to allow client-side
  deduping.
- Felica tags should continue to emit `idm`/`systemCode`; `id` may be absent and must
  be documented as such.
- User cancels session or moves app to background should emit session closed and
  release resources cleanly.
- Device lacks NFC permission/entitlement should surface a clear error and avoid
  leaving sessions active.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Provide an opt-in iOS tag-reader event registration that emits
  `NfcManagerDiscoverTag` events containing `id` derived from tag UID for ISO14443 and
  ISO15693 tags, while keeping sessions active for continuous scanning. Expose this as
  a new opt-in method (e.g., `registerTagEventEx`); Android may alias to existing
  registration behavior.
- **FR-002**: Preserve default NDEF-based `registerTagEvent` behavior on iOS when the
  opt-in mode is not used; emitted payloads and lifecycle must remain unchanged.
- **FR-003**: Emit `NfcManagerSessionClosed` on tag reader invalidate/cancel and restart
  polling automatically after each successful emit or recoverable connect error.
- **FR-004**: Emit Felica tag data with `idm`/`systemCode`; if UID cannot be mapped to
  `id`, document this in the payload contract while keeping tech identification.
- **FR-005**: Update public type definitions and docs to describe the opt-in API/flag,
  payload fields (`id`, `tech`, `idm`, `systemCode`), and platform-specific behavior.
- **FR-006**: Add automated tests (unit and integration where possible) plus documented
  on-device test steps to verify UID presence, repeatability across scans, and NDEF
  regression coverage.
- **FR-007**: Provide a usage example in the documentation that shows enabling the
  opt-in mode, handling discover/close events, and performing client-side deduping via
  `id`.

### Key Entities *(include if feature involves data)*

- **Tag Event Payload**: Includes `id` (hex UID when available), `tech`, optional
  `idm/systemCode`, and other tag metadata emitted to JS listeners.
- **Tag Reader Session**: Represents the opt-in iOS session state that restarts polling
  after each tag and emits session-closed events on invalidate/cancel.

## Assumptions

- iOS devices support Core NFC with required entitlements enabled; Android behavior is
  unchanged from upstream.
- Keyhive phone app consumes `tag.id` to resolve keys via backend lookup; no additional
  on-device parsing is required.
- Felica tags will expose `idm/systemCode` rather than a normalized `id`, and this is
  acceptable for downstream handling.
- Physical device testing is available for iOS to validate UID presence and session
  lifecycle; simulator use is out of scope.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: In opt-in mode on supported iOS devices, 100% of MiFare/ISO15693/ISO7816
  tag events emit a non-empty `id` within 1 second of tag tap during a 10-tag
  continuous scan.
- **SC-002**: Default NDEF event mode exhibits zero regression in payload shape and
  lifecycle across iOS and Android when running existing NDEF regression scenarios.
- **SC-003**: A developer new to the fork follows the documented example end-to-end and
  obtains UID-bearing events on-device within 5 minutes without extra guidance.
- **SC-004**: On-device repeat-scan test shows identical `id` values for the same tag
  across three consecutive taps with no session restart.
