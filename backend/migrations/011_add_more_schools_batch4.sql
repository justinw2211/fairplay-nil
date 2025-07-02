-- Add more Division I schools
BEGIN;

INSERT INTO public.schools (name, division)
VALUES
    -- Pac-12 Conference
    ('University of Arizona', 'I'),
    ('Arizona State University', 'I'),
    ('University of California, Berkeley', 'I'),
    ('University of California, Los Angeles', 'I'),
    ('University of Colorado Boulder', 'I'),
    ('University of Oregon', 'I'),
    ('Oregon State University', 'I'),
    ('University of Southern California', 'I'),
    ('Stanford University', 'I'),
    ('University of Utah', 'I'),
    ('University of Washington', 'I'),
    ('Washington State University', 'I'),

    -- Big 12 Conference
    ('Baylor University', 'I'),
    ('University of Central Florida', 'I'),
    ('University of Cincinnati', 'I'),
    ('University of Houston', 'I'),
    ('Iowa State University', 'I'),
    ('University of Kansas', 'I'),
    ('Kansas State University', 'I'),
    ('Oklahoma State University', 'I'),
    ('Texas Christian University', 'I'),
    ('Texas Tech University', 'I'),
    ('West Virginia University', 'I'),
    ('Brigham Young University', 'I'),

    -- Big East Conference
    ('Butler University', 'I'),
    ('Creighton University', 'I'),
    ('DePaul University', 'I'),
    ('Georgetown University', 'I'),
    ('Marquette University', 'I'),
    ('St. John''s University', 'I'),
    ('Seton Hall University', 'I'),
    ('University of Connecticut', 'I'),
    ('Villanova University', 'I'),
    ('Xavier University', 'I'),

    -- American Athletic Conference
    ('East Carolina University', 'I'),
    ('Florida Atlantic University', 'I'),
    ('University of Memphis', 'I'),
    ('University of North Texas', 'I'),
    ('Rice University', 'I'),
    ('University of South Florida', 'I'),
    ('Southern Methodist University', 'I'),
    ('Temple University', 'I'),
    ('Tulane University', 'I'),
    ('University of Alabama at Birmingham', 'I'),
    ('University of Texas at San Antonio', 'I'),
    ('University of North Carolina at Charlotte', 'I'),
    ('University of South Alabama', 'I'),
    ('Tulsa University', 'I')
ON CONFLICT (name) DO NOTHING;

COMMIT; 