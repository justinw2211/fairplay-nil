# 🎭 Playwright Authentication Setup for FairPlay NIL

## 🔐 **Test User Account**

We're using an existing test account for Playwright authentication:
- **Email**: `test1@test.edu`
- **Password**: `testuser`

## 🚀 **How to Run Authenticated Tests**

### **1. Run All Authenticated Tests**
```bash
npm run test:e2e:auth
```

### **2. Run with Browser Visible**
```bash
npm run test:e2e:auth:headed
```

### **3. Run with Debug Mode**
```bash
npm run test:e2e:auth:debug
```

### **4. Setup Authentication (First Time)**
```bash
npm run test:e2e:setup-auth
```

## 📁 **File Structure**

```
frontend/
├── global-setup.js                    # Authentication setup
├── playwright.config.js               # Updated config with auth projects
├── playwright/.auth/                  # Stored auth state
│   └── user.json                     # Saved authentication
├── tests/
│   ├── auth-test.spec.js             # Authentication verification
│   ├── deal-wizard-comprehensive.spec.js  # Full wizard flow tests
│   └── deal-wizard.spec.js           # Original basic tests
```

## 🔧 **How It Works**

### **1. Global Setup**
- `global-setup.js` logs in once using test credentials
- Saves authentication state to `playwright/.auth/user.json`
- All authenticated tests use this saved state

### **2. Test Projects**
- **Unauthenticated**: `chromium`, `firefox`, `webkit` (original)
- **Authenticated**: `chromium-auth`, `firefox-auth` (new)

### **3. Protected Route Access**
Authenticated tests can access:
- `/dashboard`
- `/add/deal/social-media/:dealId`
- `/add/deal/terms/:dealId`
- `/clearinghouse-wizard/:dealId`
- `/valuation-wizard/:dealId`

## 🧪 **Test Categories**

### **Authentication Tests** (`auth-test.spec.js`)
- Verify login works
- Test protected route access
- Check user-specific elements

### **Comprehensive Wizard Tests** (`deal-wizard-comprehensive.spec.js`)
- Full deal wizard flow
- Form interactions
- Step navigation
- Data persistence

### **Basic Tests** (original files)
- Smoke tests
- Setup verification
- Error handling

## 🎯 **Usage Examples**

### **Test Protected Routes**
```javascript
// This test runs with authentication
test('should access dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

### **Test Deal Wizard Flow**
```javascript
// This test can walk through the entire wizard
test('should complete deal wizard', async ({ page }) => {
  await page.goto('/add/deal/social-media/test-id');
  // Fill forms, navigate steps, etc.
});
```

## 🔄 **Updating Authentication**

If the test user credentials change:

1. **Update `global-setup.js`** with new credentials
2. **Delete `playwright/.auth/user.json`** (if it exists)
3. **Run setup again**: `npm run test:e2e:setup-auth`

## 🚨 **Troubleshooting**

### **Authentication Fails**
```bash
# Check if login page is accessible
curl http://localhost:3000/login

# Verify test user exists
# Check Supabase for test1@test.edu account
```

### **Tests Still Fail**
```bash
# Run with debug to see what's happening
npm run test:e2e:auth:debug

# Check screenshots in test-results/
# Look for auth-test-*.png files
```

### **Protected Routes Not Accessible**
- Verify the test user has proper permissions
- Check if routes require additional setup
- Ensure authentication state is saved correctly

## 📊 **Benefits**

1. **Real User Testing**: Tests actual authentication flow
2. **Protected Route Access**: Can test full wizard functionality
3. **Form Interactions**: Can fill out forms and test validation
4. **Step Navigation**: Can test multi-step workflows
5. **Data Persistence**: Can test data saving between steps

## 🎉 **Ready to Use**

Your Playwright setup now supports:
- ✅ Authenticated testing
- ✅ Protected route access
- ✅ Full deal wizard flow testing
- ✅ Real user experience simulation
- ✅ Comprehensive test coverage

**Run `npm run test:e2e:auth` to start testing with authentication!** 