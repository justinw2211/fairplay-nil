# Playwright Tests Directory

** test only on the chrome browser and on the production vercel link **

## 📁 **File Structure**

```
frontend/tests/
├── README.md                           # This file - Directory overview
├── active-tests/                       # Main deal flow tests (currently working)
│   ├── simple-deal-logging-flow.spec.js      # ✅ Complete (9/9 steps)
│   ├── clearinghouse-deal-flow.spec.js       # ✅ Complete (10/10 steps)
│   └── valuation-deal-flow.spec.js           # 🔄 In Progress (6/10 steps)
├── basic-tests/                        # Basic functionality tests
│   ├── auth-test.spec.js              # Authentication verification
│   ├── local-dev-test.spec.js         # Local development setup
│   ├── application-test.spec.js        # Application smoke tests
│   ├── app-check.spec.js              # App functionality checks
│   ├── setup-verification.spec.js     # Environment setup verification
│   ├── deal-wizard.spec.js            # Basic deal wizard tests
│   └── smoke.spec.js                  # Smoke tests
└── docs/                              # Documentation
    ├── PLAYWRIGHT_TESTING_GUIDE.md    # Main testing guide
    └── outdated/                      # Archived documentation
        ├── PLAYWRIGHT_SUMMARY.md.OUTDATED
        ├── PLAYWRIGHT_PROGRESS_NOTES.md.OUTDATED
        ├── PLAYWRIGHT_FINDINGS.md.OUTDATED
        ├── PLAYWRIGHT_CONTEXT.md.OUTDATED
        ├── DEAL_TYPE_TESTING_GUIDE.md.OUTDATED
        ├── deal-type-diagnostic.spec.js
        ├── deal-type-comparison.spec.js
        └── deal-wizard-comprehensive.spec.js
```

## 🎯 **Active Tests (Use These)**

### **Deal Flow Tests** (`active-tests/`)
These are the main end-to-end tests for the three deal types:

#### **1. Simple Deal Logging** ✅ **COMPLETE**
- **File**: `active-tests/simple-deal-logging-flow.spec.js`
- **Status**: 9/9 steps working (100%)
- **Command**: `npx playwright test active-tests/simple-deal-logging-flow.spec.js --project=chromium-auth`
- **Flow**: Dashboard → Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review → Dashboard

#### **2. Clearinghouse Deal Flow** ✅ **IN PROGRESS**
- **File**: `active-tests/clearinghouse-deal-flow.spec.js`
- **Status**: 10/10 steps working (100%)
- **Command**: `npx playwright test active-tests/clearinghouse-deal-flow.spec.js --project=chromium-auth`
- **Flow**: Dashboard → Social Media → Deal Terms → Payor Info → Activities → Activity Form → Compliance → Compensation → Review → Prediction → Dashboard

#### **3. Valuation Deal Flow** 🔄 **IN PROGRESS**
- **File**: `active-tests/valuation-deal-flow.spec.js`
- **Status**: 6/10 steps working (60%)
- **Command**: `npx playwright test active-tests/valuation-deal-flow.spec.js --project=chromium-auth`
- **Issue**: Stuck on compliance step (different UI structure)
- **Flow**: Dashboard → Social Media → Deal Terms → Payor Info → Activities → Activity Form → [Compliance] → [Compensation] → [Review] → [Valuation] → [Dashboard]

### **Basic Tests** (`basic-tests/`)
These are utility and verification tests:

- **`auth-test.spec.js`**: Authentication verification
- **`local-dev-test.spec.js`**: Local development setup verification
- **`application-test.spec.js`**: Application smoke tests
- **`app-check.spec.js`**: App functionality checks
- **`setup-verification.spec.js`**: Environment setup verification
- **`deal-wizard.spec.js`**: Basic deal wizard tests
- **`smoke.spec.js`**: General smoke tests

## 📚 **Documentation**

### **Main Guide** (`docs/`)
- **`PLAYWRIGHT_COMPREHENSIVE_GUIDE.md`**: Complete consolidated guide with all patterns, commands, troubleshooting, and development context

### **Archived Documentation** (`docs/outdated/`)
- All outdated documentation files with `.OUTDATED` suffix
- Old test files that are no longer in use
- Historical reference only

## 🚀 **Quick Start Commands**

```bash
# Run all active deal flow tests
npx playwright test active-tests/ --project=chromium-auth

# Run specific deal flow
npx playwright test active-tests/simple-deal-logging-flow.spec.js --project=chromium-auth
npx playwright test active-tests/clearinghouse-deal-flow.spec.js --project=chromium-auth
npx playwright test active-tests/valuation-deal-flow.spec.js --project=chromium-auth

# Run basic tests
npx playwright test basic-tests/ --project=chromium-auth

# Run all tests
npx playwright test --project=chromium-auth
```

## 📊 **Current Status**

- ✅ **Simple Deal Logging**: 100% complete (9/9 steps)
- ✅ **Clearinghouse Deal Flow**: 100% complete (10/10 steps)
- 🔄 **Valuation Deal Flow**: 60% complete (6/10 steps)
- 📚 **Documentation**: Cleaned and consolidated
- 🗂️ **File Structure**: Organized and clear

## 🎯 **Next Steps**

1. **Debug Valuation Flow**: Fix compliance step issue
2. **Complete Valuation Flow**: Finish remaining 4 steps
3. **Enhance Coverage**: Add more edge cases and error scenarios

**Last Updated**: August 2024  
**Status**: 2 complete flows, 1 in progress 