# Quickstart: iOS Tag-Reader UID Event Mode

## Purpose

Enable continuous iOS tag-reader event mode that emits stable tag UID (`id`) without
breaking default NDEF behavior.

## Prerequisites

- iOS device with NFC and entitlements enabled (Near Field Communication Tag Reading).
- React Native app already consuming `react-native-nfc-manager` (Keyhive fork).
- Android behavior remains unchanged.

### Device & entitlement checklist (manual test prep)

- Provisioning profile includes `Near Field Communication Tag Reading` entitlement; rebuild after enabling.
- iOS 13+ device with NFC enabled; Low Power Mode off to avoid throttling UI prompts.
- App has `NFCReaderUsageDescription` in Info.plist; device unlocked during scans.

## Install

```bash
npm install
# or
yarn install
```

## Usage (JS)

```ts
import NfcManager from 'react-native-nfc-manager';

async function startUidScan() {
  await NfcManager.start();
  await NfcManager.registerTagEventEx({
    alertMessage: 'Hold near a key tag',
    pollingOptions: ['iso14443', 'iso15693'],
  });

  NfcManager.setEventListener(NfcManager.EVENTS.DiscoverTag, (tag) => {
    // tag.id present for ISO14443/ISO15693
    console.log('UID event', tag.id, tag.tech);
  });

  NfcManager.setEventListener(NfcManager.EVENTS.SessionClosed, (evt) => {
    console.log('Session closed', evt);
  });
}

async function stopUidScan() {
  await NfcManager.unregisterTagEvent(); // cleans up sessions on both platforms
}
```

## Notes

- Default `registerTagEvent` remains NDEF-based and does not emit `id` on iOS.
- Felica tags emit `idm/systemCode`; `id` may be absent for felica.
- Sessions restart polling after each tag; expect back-to-back events without manual
  re-registration.

## Testing

1. Run the app on an NFC-capable iOS device.
2. Call `startUidScan()`.
3. Tap two different ISO14443/ISO15693 tags → observe two events with distinct `id`.
4. Tap the same tag twice → observe identical `id` values (client-side dedupe possible).
5. Cancel the session (system UI or app stop) → `SessionClosed` event fires.
6. Verify Android flows remain unchanged using existing tests.

### Manual device run log (2025-12-22, Staging)
- Environment/API: `https://admin.staging.keyhive.io`
- First scan: `tag.id=04A46072AC6D80`, tech `mifare`, ndef payload present; callbacks fired; session closed normally.
- Second scan attempt: tag payload empty `{}`; derived uuid `null`; alertMessage was null; session restarted and continued polling.
- Actions: keep alertMessage set when registering; ensure client dedupes on `tag.id` and handles empty payloads gracefully.
