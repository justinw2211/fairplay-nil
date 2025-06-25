// frontend/src/data/formConstants.js

export const GENDERS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Nonbinary", value: "Nonbinary" },
  { label: "Prefer not to say", value: "Prefer not to say" },
  { label: "Other", value: "Other" },
];

export const MEN_SPORTS = [
  "Baseball", "Basketball", "Cross Country", "Fencing", "Football", "Golf",
  "Gymnastics", "Ice Hockey", "Lacrosse", "Rifle", "Rowing", "Skiing", "Soccer",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Volleyball", "Water Polo", "Wrestling"
].map(s => ({ label: s, value: s }));

export const WOMEN_SPORTS = [
  "Acrobatics & Tumbling", "Basketball", "Beach Volleyball", "Bowling", "Cross Country",
  "Equestrian", "Fencing", "Field Hockey", "Golf", "Gymnastics", "Ice Hockey",
  "Lacrosse", "Rifle", "Rowing", "Rugby", "Skiing", "Soccer", "Softball",
  "Swimming & Diving", "Tennis", "Track & Field (Indoor)", "Track & Field (Outdoor)",
  "Triathlon", "Volleyball", "Water Polo", "Wrestling"
].map(s => ({ label: s, value: s }));

export const COMBINED_SPORTS = [
    ...MEN_SPORTS.map(s => ({ label: `Men's ${s.label}`, value: `Men's ${s.value}` })),
    ...WOMEN_SPORTS.map(s => ({ label: `Women's ${s.label}`, value: `Women's ${s.value}` }))
].sort((a, b) => a.label.localeCompare(b.label));

// [FP-REFACTOR-018] Added Industry Options
export const industryOptions = [
    "Apparel & Fashion", "Automotive", "Beverages (Non-Alcoholic)", "Camps & Clinics", 
    "Collectibles & Memorabilia", "Consumer Packaged Goods (CPG)", "Electronics", 
    "Events & Appearances", "Financial Services", "Food & Restaurants", 
    "Gaming & eSports", "Health & Wellness", "Home Goods", "Media & Content Creation", 
    "Sports Equipment", "Supplements & Nutrition", "Technology & Apps", 
    "Travel & Hospitality", "Other"
];