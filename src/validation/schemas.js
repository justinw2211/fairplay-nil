import * as yup from 'yup';

// Schema for Step 1: Profile
export const step1Schema = yup.object().shape({
  division: yup.string().required('Division is required.'),
  school: yup.string().required('School is required.'),
  name: yup.string().trim().required('Full name is required.'),
  email: yup.string().email('Must be a valid email.').required('Valid email is required.'),
});

// Schema for Step 2: Academics & Athletics
export const step2Schema = yup.object().shape({
  gender: yup.string().required('Gender is required.'),
  sport: yup.array().of(yup.string()).min(1, 'At least one sport is required.').required('Sport is required.'),
  graduation_year: yup.number()
    .typeError('Graduation year is required.')
    .min(2024, 'Invalid year')
    .max(2035, 'Invalid year')
    .required('Graduation year is required.'),
  gpa: yup.string().test('is-gpa', 'GPA must be between 0.00 and 4.00', (value) => {
      if (value === null || value === "" || value === undefined) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 4;
    }).nullable(),
  age: yup.number()
    .transform(value => (isNaN(value) ? null : value))
    .nullable()
    .min(15, 'Must be at least 15')
    .max(99, 'Must be under 99'),
  achievements: yup.array().of(yup.string()),
  prior_nil_deals: yup.number()
    .transform(value => (isNaN(value) || value < 0 ? null : value))
    .nullable()
    .min(0, 'Cannot be negative'),
});


// Schema for Step 3: Deal Details
export const step3Schema = yup.object().shape({
  social_platforms: yup.array().of(yup.string()),
  followers_instagram: yup.number().transform(value => (isNaN(value) ? null : value)).nullable()
      .when('social_platforms', {
          is: (platforms) => platforms && platforms.includes('Instagram'),
          then: (schema) => schema.required('Follower count is required for Instagram.'),
          otherwise: (schema) => schema.optional(),
      }),
  followers_tiktok: yup.number().transform(value => (isNaN(value) ? null : value)).nullable()
      .when('social_platforms', {
        is: (platforms) => platforms && platforms.includes('TikTok'),
        then: (schema) => schema.required('Follower count is required for TikTok.'),
        otherwise: (schema) => schema.optional(),
      }),
  followers_twitter: yup.number().transform(value => (isNaN(value) ? null : value)).nullable()
      .when('social_platforms', {
        is: (platforms) => platforms && platforms.includes('X (Twitter)'),
        then: (schema) => schema.required('Follower count is required for X.'),
        otherwise: (schema) => schema.optional(),
      }),
  followers_youtube: yup.number().transform(value => (isNaN(value) ? null : value)).nullable()
      .when('social_platforms', {
        is: (platforms) => platforms && platforms.includes('YouTube'),
        then: (schema) => schema.required('Follower count is required for YouTube.'),
        otherwise: (schema) => schema.optional(),
      }),
  payment_structure: yup.array().of(yup.string()).min(1, 'Payment structure is required.').required(),
  payment_structure_other: yup.string().when('payment_structure', {
    is: (structures) => structures && structures.includes('Other'),
    then: (schema) => schema.trim().required('Please describe the payment structure.'),
    otherwise: (schema) => schema.optional(),
  }),
  deal_length_months: yup.number()
    .typeError('Deal length is required.')
    .min(1, 'Must be at least 1 month')
    .required('Deal length is required.'),
  proposed_dollar_amount: yup.number()
    .typeError('Proposed amount is required.')
    .min(0, 'Amount cannot be negative')
    .required('Proposed amount is required.'),
  deal_category: yup.array().of(yup.string()).min(1, 'Deal category is required.').required(),
  brand_partner: yup.string().trim().required('Brand partner is required.'),
  deliverables: yup.array()
    .of(yup.string())
    .min(1, 'Select at least one deliverable.')
    .test(
        'none-exclusive',
        'If "None" is selected, no other deliverables can be chosen.',
        (value) => !value || !(value.includes('None') && value.length > 1)
    )
    .required(),
  deliverable_other: yup.string().when('deliverables', {
      is: (deliverables) => deliverables && deliverables.includes('Other'),
      then: (schema) => schema.trim().required('Please describe the other deliverable.'),
      otherwise: (schema) => schema.optional(),
  }),
  deliverables_count: yup.object().when('deliverables', ([deliverables], schema) => {
    if (!deliverables || deliverables.length === 0 || deliverables.includes('None')) {
      return yup.object();
    }
    const shape = deliverables.reduce((acc, deliverable) => {
      if (deliverable !== 'Other') {
        acc[deliverable] = yup.number()
          .transform(value => (isNaN(value) ? undefined : value))
          .typeError('Must be a number')
          .min(1, 'Quantity must be at least 1')
          .required(`Quantity for ${deliverable} is required.`);
      }
      return acc;
    }, {});
    return yup.object().shape(shape);
  }),
  is_real_submission: yup.string().required('Please select an option.'),
});