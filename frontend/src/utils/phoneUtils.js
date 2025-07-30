// frontend/src/utils/phoneUtils.js

// Phone number formatting function
export const formatPhoneNumber = (value) => {
  if (!value) {return value;}
  const phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length < 4) {return phoneNumber;}
  if (phoneNumber.length < 7) {return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;}
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Phone number unformatting function
export const unformatPhoneNumber = (value) => {
  if (!value) {return value;}
  return value.replace(/[^\d]/g, '');
};

// Phone number validation function
export const validatePhoneNumber = (value) => {
  const digits = value ? value.replace(/[^\d]/g, '') : '';
  return digits.length === 10;
};