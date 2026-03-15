'use strict';

describe('NativeNfcManager resolution', () => {
  const nativeModulesManager = {
    start: jest.fn(),
  };

  const turboModulesManager = {
    start: jest.fn(),
  };

  const setupReactNativeMock = () => {
    jest.doMock('react-native', () => ({
      NativeModules: {
        NfcManager: nativeModulesManager,
      },
      NativeEventEmitter: jest.fn((nativeModule) => ({
        nativeModule,
        addListener: jest.fn(),
      })),
    }));
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete global.__turboModuleProxy;
  });

  test('uses NativeModules.NfcManager by default', () => {
    jest.isolateModules(() => {
      setupReactNativeMock();

      const {NativeNfcManager} = require('../src/NativeNfcManager');

      expect(NativeNfcManager).toBe(nativeModulesManager);
    });
  });

  test('uses specs NativeNfcManager when turbo module is enabled', () => {
    jest.isolateModules(() => {
      global.__turboModuleProxy = {};
      setupReactNativeMock();

      jest.doMock(
        '../specs/NativeNfcManager',
        () => ({
          __esModule: true,
          default: turboModulesManager,
        }),
        {virtual: true},
      );

      const {NativeNfcManager} = require('../src/NativeNfcManager');

      expect(NativeNfcManager).toBe(turboModulesManager);
    });
  });

  test('falls back to NativeModules.NfcManager when turbo specs import fails', () => {
    jest.isolateModules(() => {
      global.__turboModuleProxy = {};
      setupReactNativeMock();

      jest.doMock(
        '../specs/NativeNfcManager',
        () => {
          throw new Error('spec module unavailable');
        },
        {virtual: true},
      );

      const {NativeNfcManager} = require('../src/NativeNfcManager');

      expect(NativeNfcManager).toBe(nativeModulesManager);
    });
  });
});
