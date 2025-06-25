// frontend/src/validation/schemas.js
import * as yup from 'yup';

// Schema for Step 1: The Basics
export const dealStep1Schema = yup.object().shape({
  payor_name: yup.string().required('Payor name is required.'),
  payor_industry: yup.string().required('Payor industry is required.'),
  deal_description: yup.string().required('A brief deal description is required.').max(200, 'Description must be 200 characters or less.'),
  has_relationship: yup.string().required('Please specify if a relationship exists.'),
  payor_relationship_details: yup.string().when('has_relationship', {
    is: 'yes',
    then: (schema) => schema.required('Please describe the relationship.'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Schema for Step 2: Compensation
export const dealStep2Schema = yup.object().shape({
    compensation_type: yup.string().required('Please select a compensation type.'),
    compensation_amount: yup.number()
      .transform(value => (isNaN(value) || value === null || value === undefined) ? undefined : value)
      .nullable()
      .when('compensation_type', {
          is: (val) => val === 'Cash' || val === 'Mixed',
          then: (schema) => schema.required('Cash amount is required for this compensation type.').min(0, "Amount can't be negative."),
      }),
    compensation_in_kind_description: yup.string().when('compensation_type', {
      is: (val) => val === 'In-Kind' || val === 'Mixed',
      then: (schema) => schema.required('Please describe the goods or services.'),
    }),
});

// Schema for Step 3: The Rules
export const dealStep3Schema = yup.object().shape({
    uses_school_ip: yup.boolean().required('This field is required.'),
    has_conflicts: yup.string().required('This field is required.'),
});

// Schema for Step 4: The Agreement
export const dealStep4Schema = yup.object().shape({
    has_written_contract: yup.boolean().required('This field is required.'),
    is_using_agent: yup.boolean().required('This field is required.'),
    agent_name: yup.string().when('is_using_agent', {
      is: true,
      then: (schema) => schema.required("Agent's name is required."),
    }),
    agent_agency: yup.string().when('is_using_agent', { // Corrected typo here
      is: true,
      then: (schema) => schema.required("Agency name is required."),
    }),
});