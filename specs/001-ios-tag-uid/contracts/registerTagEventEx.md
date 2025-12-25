# API Contract: registerTagEventEx (Opt-in iOS Tag-Reader Event Mode)

## Summary
Expose a new opt-in registration method that uses iOS `NFCTagReaderSession` to emit
`NfcManagerDiscoverTag` events containing `id` for supported technologies. Android
aliases to existing `registerTagEvent` behavior.

## Signature (JS)
```ts
registerTagEventEx(options?: {
  alertMessage?: string;
  skipNdefRead?: boolean; // passthrough, default false
  pollingOptions?: 'iso14443' | 'iso15693' | 'iso18092' | Array<'iso14443' | 'iso15693' | 'iso18092'>;
}): Promise<void>;
```

## Events
- **NfcManagerDiscoverTag** (unchanged name)
  - `id` (string, hex, optional): Present for ISO14443/ISO15693/ISO7816 on iOS when using this method.
  - `tech` (string): e.g., `mifare`, `iso15693`, `IsoDep`, `felica`.
  - `idm` (string, optional): Felica identifier.
  - `systemCode` (string, optional): Felica system code.
  - Other existing fields unchanged; NDEF fields are not required for UID mode.
- **NfcManagerSessionClosed**: Emitted on session invalidate/cancel with error info.

## Platform Behavior
- **iOS**: Uses `NFCTagReaderSession` with polling defaults `ISO14443 | ISO15693`; calls
  `restartPolling` after each tag; connects before emitting; keeps session active until
  invalidate/cancel. Felica emits `idm/systemCode`; `id` not guaranteed for felica.
- **Android**: Behaves like existing `registerTagEvent` (no behavior change).

## Constraints & Compatibility
- Opt-in only; default `registerTagEvent` remains NDEF-based and unchanged.
- Requires iOS NFC entitlements; simulator unsupported.
- Payload shape for existing APIs remains backward compatible.

## Error Cases
- Duplicate registration when a session is already active → reject/throw similar to existing behavior.
- Connect failure → emit nothing, restartPolling, keep session active.
- Fatal session invalidate → emit `NfcManagerSessionClosed`, clear state.

## Acceptance (from spec)
- Continuous scanning emits `id` per tag; session stays active.
- Default NDEF path unchanged on iOS and Android.
- Developers can enable mode via documented method and typings.
