export type NCAAdivision = 'I' | 'II' | 'III' | 'NAIA' | 'JUCO';

export interface School {
  name: string;
  division: NCAAdivision;
}

export const NCAA_SCHOOLS: School[] = [
  // Division I Schools (ACC)
  { name: 'Clemson University', division: 'I' },
  { name: 'Duke University', division: 'I' },
  { name: 'Florida State University', division: 'I' },
  { name: 'Georgia Institute of Technology', division: 'I' },
  { name: 'University of Louisville', division: 'I' },
  { name: 'University of Miami', division: 'I' },
  { name: 'University of North Carolina', division: 'I' },
  { name: 'North Carolina State University', division: 'I' },
  { name: 'University of Pittsburgh', division: 'I' },
  { name: 'Syracuse University', division: 'I' },
  { name: 'University of Virginia', division: 'I' },
  { name: 'Virginia Tech', division: 'I' },
  { name: 'Wake Forest University', division: 'I' },

  // Division I Schools (Big Ten)
  { name: 'University of Illinois', division: 'I' },
  { name: 'Indiana University', division: 'I' },
  { name: 'University of Iowa', division: 'I' },
  { name: 'University of Maryland', division: 'I' },
  { name: 'University of Michigan', division: 'I' },
  { name: 'Michigan State University', division: 'I' },
  { name: 'University of Minnesota', division: 'I' },
  { name: 'University of Nebraska', division: 'I' },
  { name: 'Northwestern University', division: 'I' },
  { name: 'Ohio State University', division: 'I' },
  { name: 'Penn State University', division: 'I' },
  { name: 'Purdue University', division: 'I' },
  { name: 'Rutgers University', division: 'I' },
  { name: 'University of Wisconsin', division: 'I' },

  // Division I Schools (SEC)
  { name: 'University of Alabama', division: 'I' },
  { name: 'University of Arkansas', division: 'I' },
  { name: 'Auburn University', division: 'I' },
  { name: 'University of Florida', division: 'I' },
  { name: 'University of Georgia', division: 'I' },
  { name: 'University of Kentucky', division: 'I' },
  { name: 'Louisiana State University', division: 'I' },
  { name: 'University of Mississippi', division: 'I' },
  { name: 'Mississippi State University', division: 'I' },
  { name: 'University of Missouri', division: 'I' },
  { name: 'University of South Carolina', division: 'I' },
  { name: 'University of Tennessee', division: 'I' },
  { name: 'Texas A&M University', division: 'I' },
  { name: 'Vanderbilt University', division: 'I' },

  // Division II Schools
  { name: 'Assumption University', division: 'II' },
  { name: 'Bentley University', division: 'II' },
  { name: 'American International College', division: 'II' },
  { name: 'Franklin Pierce University', division: 'II' },
  { name: 'Merrimack College', division: 'II' },
  { name: 'Saint Anselm College', division: 'II' },
  { name: "Saint Michael's College", division: 'II' },
  { name: 'Southern New Hampshire University', division: 'II' },
  { name: 'Stonehill College', division: 'II' },

  // Division III Schools
  { name: 'Amherst College', division: 'III' },
  { name: 'Babson College', division: 'III' },
  { name: 'Bates College', division: 'III' },
  { name: 'Bowdoin College', division: 'III' },
  { name: 'Brandeis University', division: 'III' },
  { name: 'Colby College', division: 'III' },
  { name: 'Connecticut College', division: 'III' },
  { name: 'Emerson College', division: 'III' },
  { name: 'Emmanuel College', division: 'III' },
  { name: 'Endicott College', division: 'III' },
  { name: 'Gordon College', division: 'III' },
  { name: 'Lasell University', division: 'III' },
  { name: 'Massachusetts Institute of Technology', division: 'III' },
  { name: 'Middlebury College', division: 'III' },
  { name: 'Mount Holyoke College', division: 'III' },
  { name: 'Smith College', division: 'III' },
  { name: 'Trinity College', division: 'III' },
  { name: 'Tufts University', division: 'III' },
  { name: 'Wellesley College', division: 'III' },
  { name: 'Wesleyan University', division: 'III' },
  { name: 'Wheaton College', division: 'III' },
  { name: 'Williams College', division: 'III' }
];

// Helper functions
export const getSchoolsByDivision = (division: NCAAdivision): School[] => {
  return NCAA_SCHOOLS.filter(school => school.division === division);
};

export const getAllSchoolNames = (): string[] => {
  return NCAA_SCHOOLS.map(school => school.name);
};

export const getDivisionForSchool = (schoolName: string): NCAAdivision | undefined => {
  const school = NCAA_SCHOOLS.find(s => s.name === schoolName);
  return school?.division;
}; 