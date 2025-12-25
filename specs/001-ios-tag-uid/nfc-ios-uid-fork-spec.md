# NFC iOS UID Fork Plan for `react-native-nfc-manager`

## Purpose

Enable continuous/event-driven bulk scans on iOS to emit a stable tag UID (`tag.id`) so the app can resolve keys via GraphQL. Achieve this by adding an iOS tag-reader event path to `react-native-nfc-manager` (forked), without breaking existing NDEF behavior or Android behavior.

## Background & References

- Library: https://github.com/revtel/react-native-nfc-manager
- Issue (no `tag.id` on iOS continuous scans): https://github.com/revtel/react-native-nfc-manager/issues/800
- Related CoreNFC constraints:
  - CoreNFC exposes `identifier` via `NFCTagReaderSession` (MiFare/ISO15693/ISO7816 tags) after connect.
  - NDEF event path (`NFCNDEFReaderSession` / `registerTagEvent`) does **not** expose stable UID.
- UID availability discussions:
  - iOS random/missing UID: https://stackoverflow.com/questions/47864007/ios-11-2-nfc-tag-random-uid
  - UID not exposed via NDEF / need custom identifier: https://github.com/FabianGroeger96/NFC-Background-reading/issues/1
- Apple docs: https://developer.apple.com/documentation/corenfc

## Current Upstream Behavior (iOS)

- `registerTagEvent` uses `NFCNDEFReaderSession`; JS `NfcManagerDiscoverTag` payload lacks `id`.
- `requestTechnology` uses `NFCTagReaderSession`; `getRNTag` already derives `id` (hex) from `identifier` for MiFare/ISO7816/ISO15693; felica emits `idm`/`systemCode`. Restart polling supported via `restartTechnologyRequest`.
- `getTag` returns connected tag with `id` when using tag reader session.

Key file: `node_modules/react-native-nfc-manager/ios/NfcManager.m`

- `getRNTag` (around L119) builds `{ tech, id, ... }` from `identifier`.
- `requestTechnology` and `restartTechnologyRequest` (around L287+).
- `registerTagEvent` (around L339+) uses NDEF reader, no UID.

## Problem Statement

Continuous/event-driven bulk scanning on iOS needs `tag.id`. The NDEF event path cannot supply UID. The tag-reader path can, but it is not wired to event mode. We need an opt-in event mode using `NFCTagReaderSession` that emits `id`.

## Requirements

- iOS: Continuous/event scanning emits `tag.id` (hex UID) for MiFare/ISO15693/ISO7816; felica preserves idm/systemCode.
- Android: unchanged behavior.
- No breaking change to existing `registerTagEvent` default (NDEF) users.
- Provide an explicit opt-in API/flag for the tag-reader event mode.
- Continue emitting `NfcManagerDiscoverTag` events; keep `NfcManagerSessionClosed` on invalidate.
- Continuous loop: after each tag emit, restart polling.

## API Proposal (JS Surface)

Option A (recommended): New method `registerTagEventEx(options)`

- iOS: uses `NFCTagReaderSession` event mode, emits `NfcManagerDiscoverTag` with `id`.
- Android: alias to existing `registerTagEvent`.

Option B: Extend `registerTagEvent` with `options.useTagReaderSession: true` (iOS-only). Default false to preserve NDEF behavior.

Payload

- Minimal: `{ id: "<HEX>", tech: "mifare" | "iso15693" | "IsoDep" | "felica" }` plus existing felica fields (`idm`, `systemCode`).
- Optional: add `ndefMessage` if read is cheap (not required for UID lookup).

## Native Implementation Outline (Objective-C, iOS)

1. Add a new RCT_EXPORT_METHOD (or flag) that sets up a tag-reader event session:

   - If `session`/`tagSession` active, return duplicated registration error.
   - Create `NFCTagReaderSession` with polling: `NFCPollingISO14443 | NFCPollingISO15693` (add `NFCPollingISO18092` if felica desired).
   - Set `alertMessage` from options; mark a boolean `isEventTagSession`.
   - `beginSession`; callback success.

2. In `tagReaderSession:didDetectTags:`:

   - Take first tag; `connectToTag`; on success build payload via existing `getRNTag` (ensures `id` from `identifier`).
   - Emit `sendEventWithName:@"NfcManagerDiscoverTag" body:payload`.
   - Call `[self->tagSession restartPolling];` to keep continuous scanning.
   - On connect error, restartPolling and return (no crash).

3. In `tagReaderSession:didInvalidateWithError:`:

   - Mirror existing behavior; send `NfcManagerSessionClosed` with error; reset state.

4. Keep `registerTagEvent` (NDEF) unchanged for backward compatibility.

5. Ensure `supportedEvents` unchanged; no new event names.

6. Keep `getRNTag` helper unchanged (already emits `id` for relevant techs).

## App Integration Notes (for downstream app)

- On iOS bulk scans, call the new opt-in method/flag to start continuous tag-reader event mode. Dedupe using `tag.id` and use GraphQL `tagByUuid`.
- Android continues with current flow.
- Remove JS-side attempts to derive UUID from `identifier`; rely on native-provided `id`.

## Testing Checklist

- iOS: Start continuous scan; tap two distinct tags → two events with distinct `id`, session persists.
- iOS: Tap same tag twice → dedupe sees same `id`.
- iOS: Cancel/leave session → `NfcManagerSessionClosed` fires.
- Android: Smoke test existing APIs (no regressions).

## Risks & Mitigations

- **Breaking NDEF users**: mitigate by new method or opt-in flag; keep default NDEF path unchanged.
- **Session stability**: ensure restartPolling on errors; invalidate cleanly on fatal errors.
- **Payload shape**: document that felica uses `idm/systemCode`; only MiFare/ISO15693/ISO7816 emit `id`.

## Deliverables

- Forked repo with iOS changes described above.
- JS usage example showing how to call the new/flagged registration.
- Release notes summarizing the iOS UID support and opt-in nature.

## Implementation Tasks (step-by-step for the fork)

1. Add opt-in API surface (preferred: `registerTagEventEx(options)`):
   - iOS implementation uses `NFCTagReaderSession` and sets an `isEventTagSession` flag; Android can alias to existing NDEF registration.
   - Validate no active `session`/`tagSession`; on duplication return error callback.
2. In `NfcManager.m` (iOS):
   - Create and hold `NFCTagReaderSession` with polling `NFCPollingISO14443 | NFCPollingISO15693` (optionally `NFCPollingISO18092`).
   - Set `alertMessage` from options; call `beginSession`.
   - Add event-mode branch in `tagReaderSession:didDetectTags:`: connect, build payload via `getRNTag`, emit `NfcManagerDiscoverTag`, then `restartPolling` for continuous scanning; on connect error, restartPolling.
   - Ensure `didInvalidateWithError` sends `NfcManagerSessionClosed` and resets state; do not regress existing requestTechnology behavior.
3. Keep `getRNTag` unchanged; it already maps `identifier` to `id` for MiFare/ISO7816/ISO15693 and felica idm/systemCode.
4. Preserve existing `registerTagEvent` (NDEF) and default behavior; no breaking changes.
5. JS typings: extend `index.d.ts` to include the new method/flag and payload `id` availability for iOS tag-reader mode.
6. Document usage (README excerpt) with an iOS sample showing continuous scan subscription and `id` extraction.

## Payload Examples (expected in JS)

- MiFare / ISO15693 / ISO7816: `{ id: "04A46072AC6D80", tech: "mifare" }`
- Felica: `{ tech: "felica", idm: "...", systemCode: "..." }` (note: `id` may be absent for felica; document this).

## Downstream App Integration (what the app will change)

- On iOS, call the new opt-in registration for continuous bulk scans; continue to listen to `NfcManagerDiscoverTag` and use `tag.id` for GraphQL `tagByUuid`.
- Keep Android path unchanged.
- Remove any JS fallbacks that attempt to derive UUID from `identifier`/`tagID`; rely on native `id`.

## Compatibility Notes

- iOS tag reader sessions require iOS 13+ (already a library requirement for tag reader). NDEF remains available on iOS 11+.
- Android unchanged; no code changes needed.
- Ensure felica polling is included only if required; default to ISO14443/ISO15693 to minimize overhead unless felica tags are in scope.

## Non-goals / Scope Guardrails

- Do not change default `registerTagEvent` behavior (NDEF) or break existing apps.
- Do not modify Android native code.
- Do not rely on private APIs; use only CoreNFC public APIs.

## Testing & Logging Guidance

- Add temporary debug logs (NSLog) around tag detection and restartPolling during development; remove or guard behind debug flag before release.
- Manual device tests: two distinct tags, repeat same tag, cancel session, background/foreground where applicable.
- Verify `NfcManagerSessionClosed` still fires on invalidate/cancel.

## Publishing the Fork

- Publish as a scoped npm package or git tag (e.g., `@your-scope/react-native-nfc-manager`).
- Update README with the new method/flag and iOS UID caveat.
- Note in release notes that iOS UID now available in continuous/tag-reader mode via opt-in API.
