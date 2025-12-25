jest.mock('../src/NativeNfcManager');

import {Platform} from 'react-native';
import {NfcManagerEmitter, callNative} from '../src/NativeNfcManager';

describe('NfcManagerIOS registerTagEventEx', () => {
  let NfcManager;
  let NfcEvents;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.setOS('ios');
    const NfcManagerModule = require('../src/index.js');
    NfcManager = NfcManagerModule.default;
    NfcEvents = NfcManagerModule.NfcEvents;
  });

  test('bridges default options to native', () => {
    NfcManager.registerTagEventEx();
    const lastCall = callNative.mock.calls[callNative.mock.calls.length - 1];
    expect(lastCall[0]).toBe('registerTagEventEx');
    const options = lastCall[1][0];
    expect(options.alertMessage).toBe('Please tap NFC tags');
    expect(options.pollingOptions).toEqual(['iso14443', 'iso15693']);
  });

  test('emits DiscoverTag with id', () => {
    let received = null;
    const tag = {id: '04A46072AC6D80', tech: 'mifare'};
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (t) => {
      received = t;
    });
    NfcManagerEmitter._testTriggerCallback(NfcEvents.DiscoverTag, tag);
    expect(received).toEqual(tag);
    expect(received.id).toBe('04A46072AC6D80');
  });
});
