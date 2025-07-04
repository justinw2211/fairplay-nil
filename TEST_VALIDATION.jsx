// TEST_VALIDATION.jsx - Simple test of our validation system
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { 
  useStandardForm, 
  FormField, 
  PhoneField,
  initialSignupSchema,
  TOAST_MESSAGES 
} from './frontend/src/components/forms';

const TestValidation = () => {
  const form = useStandardForm({
    schema: initialSignupSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    onSubmit: async (data) => {
      console.log('Form submitted:', data);
      alert('Form validation works! Check console for data.');
    },
    toastMessages: {
      success: 'Test form submitted successfully!',
      error: 'Test form submission failed',
    }
  });

  const roleOptions = [
    { value: 'student-athlete', label: 'Student Athlete' },
    { value: 'brand', label: 'Brand/Business' },
    { value: 'collective', label: 'Collective' },
  ];

  return (
    <ChakraProvider>
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Form Validation Test</h2>
        <p>This tests our standardized form validation system.</p>
        
        <form onSubmit={form.handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <FormField
              name="email"
              control={form.control}
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              isRequired
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <FormField
              name="password"
              control={form.control}
              type="password"
              label="Password"
              placeholder="Enter password (min 8 chars)"
              isRequired
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <FormField
              name="confirmPassword"
              control={form.control}
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              isRequired
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <FormField
              name="role"
              control={form.control}
              type="react-select"
              label="Role"
              placeholder="Select your role"
              options={roleOptions}
              isRequired
              isSearchable={false}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              type="submit" 
              disabled={!form.isValid || form.isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: form.isValid ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: form.isValid ? 'pointer' : 'not-allowed'
              }}
            >
              {form.isSubmitting ? 'Submitting...' : 'Test Submit'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Form State:</h4>
          <p>Valid: {form.isValid ? 'Yes' : 'No'}</p>
          <p>Has Errors: {form.hasErrors ? 'Yes' : 'No'}</p>
          <p>Is Dirty: {form.isDirty ? 'Yes' : 'No'}</p>
          <p>Is Submitting: {form.isSubmitting ? 'Yes' : 'No'}</p>
          
          {form.hasErrors && (
            <div style={{ marginTop: '10px' }}>
              <h5>Validation Errors:</h5>
              <ul>
                {Object.entries(form.errors).map(([field, error]) => (
                  <li key={field} style={{ color: 'red' }}>
                    {field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ChakraProvider>
  );
};

export default TestValidation; 