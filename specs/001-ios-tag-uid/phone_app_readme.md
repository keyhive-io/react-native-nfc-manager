# PhoneApp Documentation

## Overview

This directory contains documentation specific to the KeyhiveIoPhoneApp, including feature implementations, development guides, and system architecture details.

### NFC UID event mode (Keyhive fork)

- API: use `registerTagEventEx` (iOS tag reader) to receive `tag.id` for ISO14443/ISO15693; Android aliases to existing registerTagEvent.
- Entitlements: ensure `Near Field Communication Tag Reading` is enabled and `NFCReaderUsageDescription` is set; rebuild after toggling capability.
- Handling: listen to `NfcManager.EVENTS.DiscoverTag`, dedupe client-side using `tag.id`, and handle `SessionClosed` for cleanup.
- Defaults: existing `registerTagEvent` remains NDEF-based and unchanged.
- Tech coverage: felica continues to expose `idm/systemCode` (no guaranteed `id`).

## Documentation Index

### 🔑 [Add Key System](./add-key-system.md)

**Complete add key implementation documentation**

- Feature flag controlled dual flows (2-step vs 1-step)
- Component architecture and data flow
- User experience differences
- Implementation details and testing strategies
- Migration considerations

### 👨‍💻 [Add Key Developer Guide](./add-key-developer-guide.md)

**Practical development guide for add key features**

- Setup and development workflow
- Common tasks and code examples
- Debugging tips and troubleshooting
- Performance optimization
- Best practices for adding new functionality

### 🔌 [GraphQL Key Management](./graphql-key-management.md)

**GraphQL schema and API documentation for key operations**

- `CREATE_KEY` mutation details
- `CreateKeyInput` type specifications
- Query patterns and validation rules
- Error handling and performance considerations

### 🚩 [Feature Flagging System](./feature-flagging-system.md)

**Feature flag implementation and usage**

- `useFeatureFlag` hook documentation
- Implementation patterns and best practices
- Testing approaches and debugging
- Integration with Apollo cache

### 🏢 [Asset Migration Guide](./asset-migration-guide.md)

**Complete Property-to-Asset migration documentation**

- Migration overview and rationale
- Core changes in KeyhiveIoJsCore and PhoneApp
- Component updates and new Asset components
- GraphQL mutation pattern changes
- Build and deployment process
- Troubleshooting and maintenance notes

### 📱 [iOS Calendar Widget Fix](./ios-calendar-widget-fix.md)

**iOS DateTimePicker horizontal overflow fix**

- Problem description and root cause analysis
- Container styling solution implementation
- Files modified and testing verification
- Alternative approaches considered
- Maintenance and troubleshooting guidelines

## Quick Reference

### Add Key System

The PhoneApp implements a dual-flow add key system controlled by the `key-numbers` feature flag:

- **2-Step Flow** (`key-numbers` = true): Traditional wizard with KeyNumber selection → key details
- **1-Step Flow** (`key-numbers` = false): Simplified form with freetext key number + details

### Edit Key System

The PhoneApp implements feature flag-based edit key functionality:

- **Separate Modals** (`key-numbers` = true): "Change key details" and "Change key number" options
- **Unified Modal** (`key-numbers` = false): Single "Edit key" option with keyNumber field included

### Feature Flag Usage

```typescript
import {useFeatureFlag} from '@keyhive/core';

const hasKeyNumbersFeature = useFeatureFlag('key-numbers');
// true = 2-step add flow + separate edit modals
// false = 1-step add flow + unified edit modal
```

### Key Components

```
src/components/modals/add-key/
├── add-key-modal.component.tsx          # Main container with feature flag logic
├── step1.component.tsx                  # KeyNumber selection (2-step)
├── step2.component.tsx                  # Key details (2-step)
└── simplified-step.component.tsx        # Combined form (1-step)

src/components/modals/edit-key/
└── edit-key-modal.component.tsx         # Edit modal with feature flag logic

src/components/modals/change-key-number/
└── change-key-number-modal.component.tsx # Separate key number change modal

src/components/key/
├── key-card.component.tsx               # Menu options based on feature flag
└── key-edit-form.component.tsx          # Reusable form with conditional keyNumber field
```

## Development Quick Start

### Adding New Key Management Features

1. Review [Add Key Developer Guide](./add-key-developer-guide.md)
2. Check feature flag state with `useFeatureFlag('key-numbers')`
3. Consider impact on both add and edit flows
4. Implement changes in both feature flag states if needed
5. Test both feature flag configurations
6. Update documentation

### Working with Feature Flags

1. Import: `import { useFeatureFlag } from '@keyhive/core';`
2. Check state: `const enabled = useFeatureFlag('feature-name');`
3. Implement conditional logic
4. Test both enabled/disabled states

## Testing Strategy

### Feature Flag Testing

```typescript
// Mock feature flag for testing
jest.mock('@keyhive/core', () => ({
  ...jest.requireActual('@keyhive/core'),
  useFeatureFlag: jest.fn(),
}));

const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<
  typeof useFeatureFlag
>;

// Test both states
mockUseFeatureFlag.mockReturnValue(true); // 2-step flow
mockUseFeatureFlag.mockReturnValue(false); // 1-step flow
```

## Integration Points

### With JsCore

- Feature flag hook implementation
- GraphQL types and mutations
- Shared components and utilities

### With Backend

- Feature flag configuration
- GraphQL API endpoints
- User/branch feature assignments

## Contributing

### Documentation Updates

When making changes to add key functionality:

1. Update relevant documentation files
2. Include code examples for new patterns
3. Update quick reference guides
4. Test documentation examples

### Code Changes

1. Follow existing patterns in the codebase
2. Test both feature flag states
3. Update unit tests
4. Document new functionality

---

**Last Updated**: June 2025  
**Maintained by**: PhoneApp Development Team
