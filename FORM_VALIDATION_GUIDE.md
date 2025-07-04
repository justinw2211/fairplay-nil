# Form Validation & Error Handling Guide

## Overview

This guide describes the standardized form validation and error handling system implemented for the FairPlay NIL application. The system provides consistent validation, error messages, form handling, and user experience across all forms.

## Key Components

### 1. Validation Messages (`frontend/src/utils/validation/validationMessages.js`)

Centralized validation error messages for consistent UX:

```javascript
import { SPECIFIC_MESSAGES, TOAST_MESSAGES } from '../utils/validation/validationMessages';

// Use specific field messages
SPECIFIC_MESSAGES.phone.invalid; // "Phone number must be 10 digits"
SPECIFIC_MESSAGES.fullName.required; // "Full name is required"

// Use toast messages
TOAST_MESSAGES.success.profileUpdated; // "Profile updated successfully"
TOAST_MESSAGES.error.validation; // "Please correct the highlighted errors..."
```

### 2. Validation Utilities (`frontend/src/utils/validation/validationUtils.js`)

Common validation functions:

```javascript
import { validatePhoneNumber, validateEmail, validatePositiveNumber } from '../utils/validation/validationUtils';

// Returns boolean
validatePhoneNumber("(555) 555-5555"); // true
validateEmail("user@example.com"); // true

// Returns { isValid: boolean, message: string }
validatePositiveNumber(100, "Price"); // { isValid: true, message: null }
validatePositiveNumber(-5, "Price"); // { isValid: false, message: "Price must be greater than 0" }
```

### 3. Yup Schemas (`frontend/src/validation/schemas.js`)

Comprehensive schemas for all forms:

```javascript
import { initialSignupSchema, athleteProfileSchema, editProfileSchema } from '../validation/schemas';

// Authentication
initialSignupSchema // Email, password, confirm password, role
loginSchema // Email, password

// Profile
athleteProfileSchema // Full name, phone, division, university, gender, sports
editProfileSchema // Same as athlete + email

// Deal Wizard
dealTermsSchema // Deal terms and dates
payorInfoSchema // Payor information
complianceSchema // Compliance fields
compensationSchema // Compensation details

// Activities
socialMediaSchema, appearanceSchema, contentSchema, etc.
```

### 4. Standard Form Hook (`frontend/src/hooks/useStandardForm.js`)

Unified form handling with built-in validation, error handling, and submission states:

```javascript
import { useStandardForm } from '../hooks/useStandardForm';

const form = useStandardForm({
  schema: editProfileSchema,
  defaultValues: { name: '', email: '' },
  onSubmit: handleSubmit,
  toastMessages: {
    success: 'Profile updated successfully',
    error: 'Failed to update profile'
  }
});

// Form methods
form.handleSubmit // Form submission handler
form.control // React Hook Form control
form.isValid // Form validation state
form.hasErrors // Has validation errors
form.isDirty // Form has changes

// Utility methods
form.setFormValue('name', 'John Doe')
form.validateField('email')
form.getFieldError('phone')
form.resetForm()
```

### 5. Form Components

#### Basic Form Field
```javascript
import { FormField } from '../components/forms';

<FormField
  name="email"
  control={form.control}
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  leftIcon={FiMail}
  isRequired
/>
```

#### Phone Field (with auto-formatting)
```javascript
import { PhoneField } from '../components/forms';

<PhoneField
  name="phone"
  control={form.control}
  label="Phone Number"
  isRequired
/>
```

#### School Field (with division filtering)
```javascript
import { SchoolField } from '../components/forms';

<SchoolField
  name="university"
  control={form.control}
  watchDivision={() => form.watchField('division')}
  isRequired
/>
```

## Usage Examples

### Simple Form with Validation

```javascript
import { useStandardForm, FormField, editProfileSchema } from '../components/forms';

const EditProfile = () => {
  const form = useStandardForm({
    schema: editProfileSchema,
    defaultValues: { name: '', email: '', phone: '' },
    onSubmit: async (data) => {
      await updateProfile(data);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FormField
        name="name"
        control={form.control}
        label="Full Name"
        isRequired
      />
      
      <PhoneField
        name="phone"
        control={form.control}
        isRequired
      />
      
      <Button 
        type="submit" 
        isLoading={form.isSubmitting}
        isDisabled={!form.isValid}
      >
        Save Changes
      </Button>
    </form>
  );
};
```

### Multi-Step Form

```javascript
const SignupWizard = () => {
  const step1Form = useStandardForm({
    schema: initialSignupSchema,
    onSubmit: (data) => setStep1Data(data)
  });

  const step2Form = useStandardForm({
    schema: athleteProfileSchema,
    onSubmit: async (data) => {
      await createAccount({ ...step1Data, ...data });
    }
  });

  return step === 1 ? (
    <form onSubmit={step1Form.handleSubmit}>
      {/* Step 1 fields */}
    </form>
  ) : (
    <form onSubmit={step2Form.handleSubmit}>
      {/* Step 2 fields */}
    </form>
  );
};
```

## Benefits

1. **Consistency**: All forms use the same validation logic and error messages
2. **DRY**: No duplicate validation code across components
3. **Type Safety**: Centralized schemas prevent validation drift
4. **User Experience**: Consistent error handling and loading states
5. **Maintainability**: Changes to validation logic only need to be made in one place
6. **Developer Experience**: Simple, declarative form definition

## Migration Guide

To migrate existing forms to the standardized system:

1. Replace manual `useForm` with `useStandardForm`
2. Replace custom field components with `FormField`, `PhoneField`, `SchoolField`
3. Use schemas from `../validation/schemas` instead of inline validation
4. Remove custom error handling (handled by the standard hook)
5. Use validation utilities for any custom validation logic

## File Structure

```
frontend/src/
├── components/forms/
│   ├── FormField.jsx          # Basic form field component
│   ├── PhoneField.jsx         # Phone number field with formatting
│   ├── SchoolField.jsx        # School selection with division filtering
│   └── index.js               # Exports all form components
├── hooks/
│   └── useStandardForm.js     # Standard form hook
├── utils/validation/
│   ├── validationMessages.js  # Centralized error messages
│   └── validationUtils.js     # Validation utility functions
└── validation/
    └── schemas.js             # Yup validation schemas
```

This standardized system ensures all forms in the FairPlay NIL application have consistent validation, error handling, and user experience. 