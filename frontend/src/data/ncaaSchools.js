// frontend/src/data/ncaaSchools.js
import { supabase } from '../supabaseClient';

// This is the single, standardized export for all NCAA school data.
// Each school is an object with a label, value, and its division.
export const NCAA_SCHOOL_OPTIONS = [
  // Division I Schools
  { name: 'Abilene Christian University', division: 'Division I' },
  { name: 'University of Alabama', division: 'Division I' },
  { name: 'Alabama A&M University', division: 'Division I' },
  { name: 'Alabama State University', division: 'Division I' },
  { name: 'University at Albany, SUNY', division: 'Division I' },
  { name: 'Alcorn State University', division: 'Division I' },
  { name: 'American University', division: 'Division I' },
  { name: 'Appalachian State University', division: 'Division I' },
  { name: 'University of Arizona', division: 'Division I' },
  { name: 'Arizona State University', division: 'Division I' },
  { name: 'University of Arkansas', division: 'Division I' },
  { name: 'Arkansas State University', division: 'Division I' },
  { name: 'Auburn University', division: 'Division I' },
  { name: 'Austin Peay State University', division: 'Division I' },
  { name: 'Ball State University', division: 'Division I' },
  { name: 'Baylor University', division: 'Division I' },
  { name: 'Belmont University', division: 'Division I' },
  { name: 'Boston College', division: 'Division I' },
  { name: 'Boston University', division: 'Division I' },
  { name: 'Bowling Green State University', division: 'Division I' },

  // Division II Schools
  { name: 'Academy of Art University', division: 'Division II' },
  { name: 'Adelphi University', division: 'Division II' },
  { name: 'Alabama-Huntsville', division: 'Division II' },
  { name: 'American International College', division: 'Division II' },
  { name: 'Anderson University', division: 'Division II' },
  { name: 'Angelo State University', division: 'Division II' },
  { name: 'Assumption College', division: 'Division II' },
  { name: 'Augusta University', division: 'Division II' },
  { name: 'Azusa Pacific University', division: 'Division II' },
  { name: 'Barton College', division: 'Division II' },
  { name: 'Bellarmine University', division: 'Division II' },
  { name: 'Bentley University', division: 'Division II' },
  { name: 'Bloomfield College', division: 'Division II' },
  { name: 'Bloomsburg University', division: 'Division II' },
  { name: 'California State University, East Bay', division: 'Division II' },

  // Division III Schools
  { name: 'Adrian College', division: 'Division III' },
  { name: 'Agnes Scott College', division: 'Division III' },
  { name: 'Albion College', division: 'Division III' },
  { name: 'Albright College', division: 'Division III' },
  { name: 'Allegheny College', division: 'Division III' },
  { name: 'Alma College', division: 'Division III' },
  { name: 'Amherst College', division: 'Division III' },
  { name: 'Anderson University', division: 'Division III' },
  { name: 'Arcadia University', division: 'Division III' },
  { name: 'Augsburg University', division: 'Division III' },
  { name: 'Augustana College', division: 'Division III' },
  { name: 'Aurora University', division: 'Division III' },
  { name: 'Austin College', division: 'Division III' },
  { name: 'Babson College', division: 'Division III' },
  { name: 'Baldwin Wallace University', division: 'Division III' }
];

export const fetchSchools = async (division = null) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id,name,division')
      .order('name');
    
    if (error) throw error;
    
    if (division) {
      return data.filter(school => school.division === division);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching schools:', error);
    return [];
  }
};

// Keep a minimal set of schools as fallback in case API fails
export const FALLBACK_SCHOOLS = [
  { name: 'Boston College', division: 'I' },
  { name: 'Harvard University', division: 'I' },
  { name: 'Bentley University', division: 'II' },
  { name: 'Amherst College', division: 'III' }
];

// NOTE: The old 'ncaaSchools' object export is removed to prevent future confusion.