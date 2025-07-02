-- Create schools table with divisions
BEGIN;

-- Create enum for NCAA divisions
CREATE TYPE ncaa_division AS ENUM ('I', 'II', 'III');

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    division ncaa_division NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create unique index on school name
CREATE UNIQUE INDEX idx_schools_name ON public.schools(name);

-- Add foreign key to profiles table
ALTER TABLE public.profiles
    ADD COLUMN school_id INTEGER REFERENCES public.schools(id);

-- Migrate existing university data
INSERT INTO public.schools (name, division)
VALUES
    -- Division I Schools
    ('Boston College', 'I'),
    ('Boston University', 'I'),
    ('Harvard University', 'I'),
    ('University of Massachusetts Amherst', 'I'),
    ('Northeastern University', 'I'),
    ('College of the Holy Cross', 'I'),
    ('University of Connecticut', 'I'),
    ('Yale University', 'I'),
    ('Brown University', 'I'),
    ('University of Rhode Island', 'I'),
    ('Providence College', 'I'),
    ('Bryant University', 'I'),
    ('University of New Hampshire', 'I'),
    ('Dartmouth College', 'I'),
    ('University of Maine', 'I'),
    ('University of Vermont', 'I'),
    
    -- Division II Schools
    ('Assumption University', 'II'),
    ('Bentley University', 'II'),
    ('American International College', 'II'),
    ('Franklin Pierce University', 'II'),
    ('Merrimack College', 'II'),
    ('Saint Anselm College', 'II'),
    ('Saint Michael''s College', 'II'),
    ('Southern New Hampshire University', 'II'),
    ('Stonehill College', 'II'),
    
    -- Division III Schools
    ('Amherst College', 'III'),
    ('Babson College', 'III'),
    ('Bates College', 'III'),
    ('Bowdoin College', 'III'),
    ('Brandeis University', 'III'),
    ('Colby College', 'III'),
    ('Connecticut College', 'III'),
    ('Emerson College', 'III'),
    ('Emmanuel College', 'III'),
    ('Endicott College', 'III'),
    ('Gordon College', 'III'),
    ('Lasell University', 'III'),
    ('Massachusetts Institute of Technology', 'III'),
    ('Middlebury College', 'III'),
    ('Mount Holyoke College', 'III'),
    ('Smith College', 'III'),
    ('Trinity College', 'III'),
    ('Tufts University', 'III'),
    ('Wellesley College', 'III'),
    ('Wesleyan University', 'III'),
    ('Wheaton College', 'III'),
    ('Williams College', 'III')
ON CONFLICT (name) DO NOTHING;

-- Update existing profiles with school_id based on university name
UPDATE public.profiles p
SET school_id = s.id
FROM public.schools s
WHERE p.university = s.name;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT; 