-- Add Division II schools
BEGIN;

INSERT INTO public.schools (name, division)
VALUES
    -- Northeast-10 Conference
    ('Adelphi University', 'II'),
    ('Le Moyne College', 'II'),
    ('New Haven University', 'II'),
    ('Pace University', 'II'),
    
    -- PSAC (Pennsylvania State Athletic Conference)
    ('Bloomsburg University', 'II'),
    ('California University of Pennsylvania', 'II'),
    ('Clarion University', 'II'),
    ('East Stroudsburg University', 'II'),
    ('Edinboro University', 'II'),
    ('Gannon University', 'II'),
    ('Indiana University of Pennsylvania', 'II'),
    ('Kutztown University', 'II'),
    ('Lock Haven University', 'II'),
    ('Mansfield University', 'II'),
    ('Mercyhurst University', 'II'),
    ('Millersville University', 'II'),
    ('Shippensburg University', 'II'),
    ('Slippery Rock University', 'II'),
    ('West Chester University', 'II'),
    
    -- CIAA (Central Intercollegiate Athletic Association)
    ('Bowie State University', 'II'),
    ('Elizabeth City State University', 'II'),
    ('Fayetteville State University', 'II'),
    ('Johnson C. Smith University', 'II'),
    ('Lincoln University', 'II'),
    ('Livingstone College', 'II'),
    ('Saint Augustine''s University', 'II'),
    ('Shaw University', 'II'),
    ('Virginia State University', 'II'),
    ('Virginia Union University', 'II'),
    ('Winston-Salem State University', 'II'),
    
    -- Great Lakes Valley Conference
    ('University of Indianapolis', 'II'),
    ('Lewis University', 'II'),
    ('McKendree University', 'II'),
    ('Missouri S&T', 'II'),
    ('Quincy University', 'II'),
    ('Rockhurst University', 'II'),
    ('Southwest Baptist University', 'II'),
    ('University of Illinois Springfield', 'II'),
    ('University of Missouri-St. Louis', 'II'),
    ('William Jewell College', 'II')
ON CONFLICT (name) DO NOTHING;

COMMIT; 