// frontend/src/data/ncaaSchools.js

// This is the single, standardized export for all NCAA school data.
// Each school is an object with a label, value, and its division.
export const NCAA_SCHOOL_OPTIONS = [
  // Division I
  { label: 'Abilene Christian University', value: 'Abilene Christian University', division: 'D1' },
  { label: 'University at Albany, SUNY', value: 'University at Albany, SUNY', division: 'D1' },
  { label: 'Alabama A&M University', value: 'Alabama A&M University', division: 'D1' },
  { label: 'Alabama State University', value: 'Alabama State University', division: 'D1' },
  // ... (and so on for all D1 schools)

  // Division II
  { label: 'Academy of Art University', value: 'Academy of Art University', division: 'D2' },
  { label: 'Adelphi University', value: 'Adelphi University', division: 'D2' },
  // ... (and so on for all D2 schools)

  // Division III
  { label: 'Adrian College', value: 'Adrian College', division: 'D3' },
  { label: 'Agnes Scott College', value: 'Agnes Scott College', division: 'D3' },
  // ... (Add all other schools here in the same format)
];

// NOTE: The old 'ncaaSchools' object export is removed to prevent future confusion.