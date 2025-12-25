# Data Model: iOS Tag-Reader UID Event Mode

## Entities

### TagEventPayload
- **Attributes**:
  - `id` (string, hex, optional): Present for ISO14443/ISO15693/ISO7816 tags when using the new event mode; absent for NDEF default path and may be absent for felica.
  - `tech` (string): Technology identifier (`mifare`, `iso15693`, `IsoDep`, `felica`, etc.).
  - `idm` (string, optional): Felica identifier.
  - `systemCode` (string, optional): Felica system code.
  - `ndefMessage` (array, optional): Only when NDEF is read (default path); not required for UID lookups.
  - Other tag metadata (per existing upstream contract) remain unchanged.
- **Relationships**: Emitted via `NfcManagerDiscoverTag` event.
- **Validation**: `id` must be non-empty hex when present; `tech` required.

### TagReaderSession (iOS opt-in)
- **Attributes**:
  - `isActive` (boolean): Indicates session lifecycle.
  - `alertMessage` (string, optional): User-facing prompt.
  - `pollingOptions` (bitmask): ISO14443, ISO15693, optionally ISO18092 for felica.
- **Behavior**: Restarts polling after each tag; emits `NfcManagerDiscoverTag`; emits `NfcManagerSessionClosed` on invalidate/cancel.

### RegisterTagEventExOptions
- **Attributes**:
  - `alertMessage` (string, optional): Shown by iOS during scanning.
  - `skipNdefRead` (boolean, optional): Keep consistent with existing option shape; not required for UID but may be passed through.
  - `pollingOptions` (optional enum/bitmask): Defaults to ISO14443 | ISO15693; may include ISO18092 if needed.
- **Constraints**: Only effective on iOS; Android treated as alias to existing behavior.

## State & Transitions

- **Idle → Active**: `registerTagEventEx` invoked; creates `NFCTagReaderSession`, begins scanning.
- **Active → TagDetected**: iOS detects tag; connect and build payload via `getRNTag`.
- **TagDetected → Active**: Emit `NfcManagerDiscoverTag`; call `restartPolling`; remain active.
- **Active → Closed**: Session invalidated (user cancel, system error); emit `NfcManagerSessionClosed` and release resources.

## Invariants

- Default `registerTagEvent` path remains unchanged (no `id` emission on iOS NDEF).
- UID emission is opt-in via new method; Android behavior is unaffected.
- Felica continues to use `idm/systemCode`; `id` not guaranteed.
