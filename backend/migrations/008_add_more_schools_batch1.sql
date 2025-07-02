-- Add more Division I schools
BEGIN;

INSERT INTO public.schools (name, division)
VALUES
    -- Division I Schools (ACC)
    ('Clemson University', 'I'),
    ('Duke University', 'I'),
    ('Florida State University', 'I'),
    ('Georgia Institute of Technology', 'I'),
    ('University of Louisville', 'I'),
    ('University of Miami', 'I'),
    ('University of North Carolina', 'I'),
    ('North Carolina State University', 'I'),
    ('University of Pittsburgh', 'I'),
    ('Syracuse University', 'I'),
    ('University of Virginia', 'I'),
    ('Virginia Tech', 'I'),
    ('Wake Forest University', 'I'),

    -- Division I Schools (Big Ten)
    ('University of Illinois', 'I'),
    ('Indiana University', 'I'),
    ('University of Iowa', 'I'),
    ('University of Maryland', 'I'),
    ('University of Michigan', 'I'),
    ('Michigan State University', 'I'),
    ('University of Minnesota', 'I'),
    ('University of Nebraska', 'I'),
    ('Northwestern University', 'I'),
    ('Ohio State University', 'I'),
    ('Penn State University', 'I'),
    ('Purdue University', 'I'),
    ('Rutgers University', 'I'),
    ('University of Wisconsin', 'I'),

    -- Division I Schools (SEC)
    ('University of Alabama', 'I'),
    ('University of Arkansas', 'I'),
    ('Auburn University', 'I'),
    ('University of Florida', 'I'),
    ('University of Georgia', 'I'),
    ('University of Kentucky', 'I'),
    ('Louisiana State University', 'I'),
    ('University of Mississippi', 'I'),
    ('Mississippi State University', 'I'),
    ('University of Missouri', 'I'),
    ('University of South Carolina', 'I'),
    ('University of Tennessee', 'I'),
    ('Texas A&M University', 'I'),
    ('Vanderbilt University', 'I')
ON CONFLICT (name) DO NOTHING;

COMMIT; 