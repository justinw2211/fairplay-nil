// frontend/src/data/formConstants.js

export const USER_ROLES = [
  { value: 'student-athlete', label: 'Student-Athlete' },
  { value: 'agent', label: 'Agent' },
  { value: 'coach', label: 'Coach' },
  { value: 'university', label: 'University' },
  { value: 'collective', label: 'Collective' },
  { value: 'brand', label: 'Brand' },
  { value: 'other', label: 'Other' }
];

export const GENDERS = ["Male", "Female", "Nonbinary", "Prefer not to say", "Other"];

export const NCAA_DIVISIONS = ["Division I", "Division II", "Division III"];

export const MEN_SPORTS = [
  "Baseball", "Basketball", "Cross Country", "Fencing", "Football", "Golf",
  "Gymnastics", "Ice Hockey", "Lacrosse", "Rifle", "Rowing", "Skiing", "Soccer",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Volleyball", "Water Polo", "Wrestling"
];

export const WOMEN_SPORTS = [
  "Acrobatics & Tumbling", "Basketball", "Beach Volleyball", "Bowling", "Cross Country",
  "Equestrian", "Fencing", "Field Hockey", "Golf", "Gymnastics", "Ice Hockey",
  "Lacrosse", "Rifle", "Rowing", "Rugby", "Skiing", "Soccer", "Softball",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Triathlon", "Volleyball", "Water Polo", "Wrestling"
];

export const COMBINED_SPORTS = [
    ...MEN_SPORTS.map(s => `Men's ${s}`),
    ...WOMEN_SPORTS.map(s => `Women's ${s}`)
].sort();

// [FP-REFACTOR-018] Added Industry Options
export const industryOptions = [
    "Apparel & Fashion", "Automotive", "Beverages (Non-Alcoholic)", "Camps & Clinics", 
    "Collectibles & Memorabilia", "Consumer Packaged Goods (CPG)", "Electronics", 
    "Events & Appearances", "Financial Services", "Food & Restaurants", 
    "Gaming & eSports", "Health & Wellness", "Home Goods", "Media & Content Creation", 
    "Sports Equipment", "Supplements & Nutrition", "Technology & Apps", 
    "Travel & Hospitality", "Other"
];