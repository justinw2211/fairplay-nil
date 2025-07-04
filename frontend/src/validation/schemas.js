// frontend/src/validation/schemas.js
import * as yup from 'yup';
import { SPECIFIC_MESSAGES, FIELD_MESSAGES } from '../utils/validation/validationMessages';
import { validatePhoneNumber } from '../utils/validation/validationUtils';

// ===============================
// AUTHENTICATION SCHEMAS
// ===============================

// Initial signup schema (step 1)
export const initialSignupSchema = yup.object().shape({
  email: yup
    .string()
    .email(FIELD_MESSAGES.email)
    .required(FIELD_MESSAGES.required('Email')),
  password: yup
    .string()
    .min(8, SPECIFIC_MESSAGES.password.minLength)
    .required(SPECIFIC_MESSAGES.password.required),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], SPECIFIC_MESSAGES.password.mismatch)
    .required('Please confirm your password'),
  role: yup
    .string()
    .required(SPECIFIC_MESSAGES.role.required),
});

// Login schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email(FIELD_MESSAGES.email)
    .required(FIELD_MESSAGES.required('Email')),
  password: yup
    .string()
    .required(SPECIFIC_MESSAGES.password.required),
});

// ===============================
// PROFILE SCHEMAS
// ===============================

// Athlete profile schema (signup step 2)
export const athleteProfileSchema = yup.object().shape({
  full_name: yup
    .string()
    .required(SPECIFIC_MESSAGES.fullName.required)
    .min(2, SPECIFIC_MESSAGES.fullName.minLength)
    .max(100, SPECIFIC_MESSAGES.fullName.maxLength),
  phone: yup
    .string()
    .required(SPECIFIC_MESSAGES.phone.required)
    .test('phone', SPECIFIC_MESSAGES.phone.invalid, validatePhoneNumber),
  division: yup
    .string()
    .required(SPECIFIC_MESSAGES.division.required),
  university: yup
    .string()
    .required(SPECIFIC_MESSAGES.university.required),
  gender: yup
    .string()
    .required(SPECIFIC_MESSAGES.gender.required),
  sports: yup
    .array()
    .of(yup.string())
    .min(1, SPECIFIC_MESSAGES.sports.minSelection)
    .required(SPECIFIC_MESSAGES.sports.required),
});

// Edit profile schema
export const editProfileSchema = yup.object().shape({
  full_name: yup
    .string()
    .required(SPECIFIC_MESSAGES.fullName.required)
    .min(2, SPECIFIC_MESSAGES.fullName.minLength)
    .max(100, SPECIFIC_MESSAGES.fullName.maxLength),
  email: yup
    .string()
    .email(FIELD_MESSAGES.email)
    .required(FIELD_MESSAGES.required('Email')),
  phone: yup
    .string()
    .required(SPECIFIC_MESSAGES.phone.required)
    .test('phone', SPECIFIC_MESSAGES.phone.invalid, validatePhoneNumber),
  division: yup
    .string()
    .required(SPECIFIC_MESSAGES.division.required),
  university: yup
    .string()
    .required(SPECIFIC_MESSAGES.university.required),
  gender: yup
    .string()
    .required(SPECIFIC_MESSAGES.gender.required),
  sports: yup
    .array()
    .of(yup.string())
    .min(1, SPECIFIC_MESSAGES.sports.minSelection)
    .required(SPECIFIC_MESSAGES.sports.required),
});

// ===============================
// DEAL WIZARD SCHEMAS
// ===============================

// Deal Step 1: Deal Terms
export const dealTermsSchema = yup.object().shape({
  payor_name: yup
    .string()
    .required(SPECIFIC_MESSAGES.payorName.required)
    .max(100, SPECIFIC_MESSAGES.payorName.maxLength),
  payor_email: yup
    .string()
    .email(FIELD_MESSAGES.email)
    .nullable(),
  payor_phone: yup
    .string()
    .nullable(),
  deal_description: yup
    .string()
    .required(SPECIFIC_MESSAGES.dealDescription.required)
    .max(200, SPECIFIC_MESSAGES.dealDescription.maxLength),
  start_date: yup
    .date()
    .required(FIELD_MESSAGES.required('Start date'))
    .min(new Date(), 'Start date must be in the future'),
  end_date: yup
    .date()
    .required(FIELD_MESSAGES.required('End date'))
    .min(yup.ref('start_date'), 'End date must be after start date'),
});

// Deal Step 2: Payor Info
export const payorInfoSchema = yup.object().shape({
  payor_type: yup
    .string()
    .required(FIELD_MESSAGES.required('Payor type')),
  payor_name: yup
    .string()
    .required(SPECIFIC_MESSAGES.payorName.required),
  payor_email: yup
    .string()
    .email(FIELD_MESSAGES.email)
    .nullable(),
  payor_phone: yup
    .string()
    .nullable(),
});

// Deal Step 5: Compliance
export const complianceSchema = yup.object().shape({
  licenses_nil: yup
    .string()
    .required('Please specify if this deal involves licensing your NIL rights'),
  uses_school_ip: yup
    .boolean()
    .required('Please specify if school branding will be visible'),
  grant_exclusivity: yup
    .string()
    .required('Please specify if this grant exclusivity'),
});

// Deal Step 6: Compensation
export const compensationSchema = yup.object().shape({
  compensation_cash: yup
    .number()
    .min(0, SPECIFIC_MESSAGES.compensation.positive)
    .nullable(),
  compensation_goods: yup
    .array()
    .of(yup.object().shape({
      description: yup.string().required('Description is required'),
      value: yup.number().min(0.01, SPECIFIC_MESSAGES.compensation.positive).required('Value is required'),
    })),
  compensation_other: yup
    .array()
    .of(yup.object().shape({
      payment_type: yup.string().required('Payment type is required'),
      description: yup.string().required('Description is required'),
      estimated_value: yup.number().min(0, SPECIFIC_MESSAGES.compensation.positive).required('Estimated value is required'),
    })),
});

// ===============================
// SOCIAL MEDIA PROFILE SCHEMAS
// ===============================

// Social Media Profile Schema for athlete profiles
export const socialMediaProfileSchema = yup.object().shape({
  platforms: yup
    .array()
    .of(
      yup.object().shape({
        platform: yup
          .string()
          .required('Platform is required')
          .oneOf(['instagram', 'twitter', 'tiktok', 'youtube', 'facebook'], 'Invalid platform'),
        handle: yup
          .string()
          .required('Handle is required')
          .matches(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @ and contain only letters, numbers, and underscores'),
        followers: yup
          .number()
          .required('Follower count is required')
          .min(0, 'Follower count cannot be negative')
          .integer('Follower count must be a whole number'),
        verified: yup.boolean().default(false),
      })
    )
    .min(1, 'At least one social media platform is required')
    .required('Social media platforms are required'),
});

// Individual Social Media Platform Schema
export const socialMediaPlatformSchema = yup.object().shape({
  platform: yup
    .string()
    .required('Platform is required')
    .oneOf(['instagram', 'twitter', 'tiktok', 'youtube', 'facebook'], 'Invalid platform'),
  handle: yup
    .string()
    .required('Handle is required')
    .matches(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @ and contain only letters, numbers, and underscores'),
  followers: yup
    .number()
    .required('Follower count is required')
    .min(0, 'Follower count cannot be negative')
    .integer('Follower count must be a whole number'),
  verified: yup.boolean().default(false),
});

// ===============================
// ACTIVITY FORM SCHEMAS
// ===============================

// Social Media Activity (for deal activities)
export const socialMediaSchema = yup.object().shape({
  platforms: yup
    .array()
    .min(1, 'Please select at least one platform')
    .required('Social media platforms are required'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
});

// Appearance Activity
export const appearanceSchema = yup.object().shape({
  selectedTypes: yup
    .array()
    .min(1, 'Please select at least one appearance type')
    .required('Appearance types are required'),
  otherAppearance: yup
    .string()
    .when('selectedTypes', {
      is: (val) => val && val.includes('other'),
      then: (schema) => schema.required('Please specify the other appearance type'),
      otherwise: (schema) => schema.nullable(),
    }),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
});

// Content Activity
export const contentSchema = yup.object().shape({
  quantity: yup
    .number()
    .required(SPECIFIC_MESSAGES.quantity.required)
    .min(1, SPECIFIC_MESSAGES.quantity.positive)
    .integer(SPECIFIC_MESSAGES.quantity.integer),
  description: yup
    .string()
    .required('Content description is required')
    .max(500, 'Description must be less than 500 characters'),
});

// Autographs Activity
export const autographsSchema = yup.object().shape({
  numberOfItems: yup
    .number()
    .required(SPECIFIC_MESSAGES.quantity.required)
    .min(1, SPECIFIC_MESSAGES.quantity.positive)
    .integer(SPECIFIC_MESSAGES.quantity.integer),
  itemTypes: yup
    .string()
    .max(200, 'Item types description must be less than 200 characters'),
});

// Merchandise Activity
export const merchandiseSchema = yup.object().shape({
  types: yup
    .string()
    .required('Merchandise types are required')
    .max(200, 'Types description must be less than 200 characters'),
  description: yup
    .string()
    .required('Royalties description is required')
    .max(500, 'Description must be less than 500 characters'),
  startDate: yup
    .date()
    .required(FIELD_MESSAGES.required('Start date')),
  endDate: yup
    .date()
    .required(FIELD_MESSAGES.required('End date'))
    .min(yup.ref('startDate'), 'End date must be after start date'),
});

// Endorsements Activity
export const endorsementsSchema = yup.object().shape({
  productName: yup
    .string()
    .required('Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  requirements: yup
    .string()
    .required('Endorsement requirements are required')
    .max(500, 'Requirements must be less than 500 characters'),
  startDate: yup
    .date()
    .required(FIELD_MESSAGES.required('Start date')),
  endDate: yup
    .date()
    .required(FIELD_MESSAGES.required('End date'))
    .min(yup.ref('startDate'), 'End date must be after start date'),
});

// Other Activity
export const otherActivitySchema = yup.object().shape({
  name: yup
    .string()
    .required('Activity name is required')
    .max(100, 'Activity name must be less than 100 characters'),
  description: yup
    .string()
    .required('Activity description is required')
    .max(500, 'Description must be less than 500 characters'),
  dueDate: yup
    .date()
    .nullable(),
});

// ===============================
// LEGACY SCHEMAS (for backward compatibility)
// ===============================

// Legacy Deal Step 1 (keeping for existing components)
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

// Legacy Deal Step 2 (keeping for existing components)
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

// Legacy Deal Step 3 (keeping for existing components)
export const dealStep3Schema = yup.object().shape({
    uses_school_ip: yup.boolean().required('This field is required.'),
    has_conflicts: yup.string().required('This field is required.'),
});

// Legacy Deal Step 4 (keeping for existing components)
export const dealStep4Schema = yup.object().shape({
    has_written_contract: yup.boolean().required('This field is required.'),
    is_using_agent: yup.boolean().required('This field is required.'),
    agent_name: yup.string().when('is_using_agent', {
      is: true,
      then: (schema) => schema.required("Agent's name is required."),
    }),
    agent_agency: yup.string().when('is_using_agent', {
      is: true,
      then: (schema) => schema.required("Agency name is required."),
    }),
});