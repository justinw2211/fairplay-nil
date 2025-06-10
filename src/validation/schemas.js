import * as yup from 'yup';

// Combined schema for the entire form data
export const fullFmvSchema = yup.object().shape({
  // Step 1 Fields
  division: yup.string().required('Division is required.'),
  school: yup.string().required('School is required.'),
  name: yup.string().trim().required('Full name is required.'),
  email: yup
    .string()
    .email('Must be a valid email.')
    .required('Valid email is required.'),
  gender: yup.string().required('Gender is required.'),
  sport: yup.string().required('Sport is required.'),
  graduation_year: yup
    .number()
    .typeError('Graduation year is required.')
    .min(2024, 'Invalid year')
    .max(2035, 'Invalid year')
    .required('Graduation year is required.'),
  gpa: yup
    .string()
    .test('is-gpa', 'GPA must be 0.00–4.00', (value) => {
      if (!value) return true; // Optional field
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 4;
    })
    .nullable(),
  age: yup
    .number()
    .typeError('Must be a number.')
    .min(15, 'Must be at least 15')
    .max(99, 'Must be under 99')
    .nullable(),
  prior_nil_deals: yup
    .number()
    .typeError('Must be a number.')
    .min(0, 'Cannot be negative')
    .nullable(),

  // Step 2 Fields
  followers_instagram: yup.number().typeError('Must be a number').min(0).nullable(),
  followers_tiktok: yup.number().typeError('Must be a number').min(0).nullable(),
  followers_twitter: yup.number().typeError('Must be a number').min(0).nullable(),
  followers_youtube: yup.number().typeError('Must be a number').min(0).nullable(),
  payment_structure: yup.string().required('Payment structure is required.'),
  payment_structure_other: yup.string().when('payment_structure', {
    is: 'Other',
    then: (schema) => schema.required('Please describe the payment structure.'),
    otherwise: (schema) => schema.optional(),
  }),
  deal_length_months: yup
    .number()
    .typeError('Deal length is required.')
    .min(1, 'Must be at least 1 month')
    .required('Deal length is required.'),
  proposed_dollar_amount: yup
    .number()
    .typeError('Proposed amount is required.')
    .min(0, 'Amount cannot be negative')
    .required('Proposed amount is required.'),
  deal_category: yup.string().required('Deal category is required.'),
  brand_partner: yup.string().trim().required('Brand partner is required.'),
  deliverables: yup
    .array()
    .of(yup.string())
    .min(1, 'Select at least one deliverable.')
    .required(),
  deliverable_other: yup.string().when('deliverables', {
    is: (deliverables) => deliverables && deliverables.includes('Other'),
    then: (schema) => schema.required('Please describe the other deliverable.'),
    otherwise: (schema) => schema.optional(),
  }),
  is_real_submission: yup.string().required('Please select an option.'),

  // Other fields that are part of the model but not the form
  achievements: yup.array().optional(),
  conference: yup.string().optional(),
  athlete_status: yup.string().optional(),
  geography: yup.string().optional(),
});
