# Research: iOS Tag-Reader UID Event Mode

## Decisions

### 1) Opt-in surface shape
- **Decision**: Add a new method `registerTagEventEx(options)` for iOS tag-reader event mode; Android aliases to existing `registerTagEvent` behavior.
- **Rationale**: Avoids breaking/ambiguous semantics of `registerTagEvent`; keeps default NDEF path untouched; clearer documentation and typings.
- **Alternatives considered**: Option flag on `registerTagEvent` (risks accidental enablement, harder to communicate defaults); global toggle (too coarse, affects all callers).

### 2) iOS native session type and loop
- **Decision**: Use `NFCTagReaderSession` with `NFCPollingISO14443 | NFCPollingISO15693` (optionally `NFCPollingISO18092` if felica is needed) and call `restartPolling` after each tag (including recoverable connect errors).
- **Rationale**: Tag reader is required to access `identifier`/UID; restartPolling keeps continuous scanning without reopening sessions.
- **Alternatives considered**: Reuse NDEF `NFCNDEFReaderSession` (does not expose UID); reopen session per tag (higher latency and worse UX).

### 3) Felica handling
- **Decision**: Keep felica payload as `idm`/`systemCode`; do not force-map to `id`. Document that `id` may be absent for felica.
- **Rationale**: Core NFC exposes felica identifiers separately; mapping would be non-standard and could confuse consumers.
- **Alternatives considered**: Derive `id` from `idm` (might misrepresent payload and break upstream parity expectations).

### 4) Payload and typings
- **Decision**: Extend JS types to reflect UID availability in the new method: `id` (hex string) for ISO14443/ISO15693/ISO7816; `tech` field present; felica has `idm/systemCode`. Keep existing payload shape for default `registerTagEvent` unchanged.
- **Rationale**: Clear contracts prevent regressions and reduce integration friction; preserves backward compatibility.
- **Alternatives considered**: Overload existing types in place (risking confusion for default users).

### 5) Documentation & examples
- **Decision**: Add README (or dedicated section) usage example showing `registerTagEventEx`, event handling, deduping by `id`, and cleanup; call out entitlements and opt-in nature.
- **Rationale**: Constitution requires doc fidelity; reduces misuse and support load.
- **Alternatives considered**: Changelog-only note (insufficient for discoverability).

### 6) Testing approach
- **Decision**: Jest unit/integration for JS surface and payload contracts; mock native for iOS branch to assert event payload includes `id` when using the new method. Add on-device manual checklist for iOS (10-tag run, repeat-same-tag dedupe, session close). Android regression: ensure existing tests still pass.
- **Rationale**: Simulator cannot exercise NFC; unit tests protect contracts; manual steps ensure real hardware behavior.
- **Alternatives considered**: Rely solely on manual testing (too brittle); add Detox (not currently set up, adds time without NFC sim support).

### 7) Security, permissions, and lifecycle
- **Decision**: Maintain minimal alert message; ensure session invalidation emits `NfcManagerSessionClosed`; avoid persisting tag data; document entitlements/permissions required.
- **Rationale**: Aligns with constitution safety gate; keeps sessions short-lived and explicit.
- **Alternatives considered**: Persist tags for debug (risk of sensitive data lingering).

## Open Questions
- None.
