-- Add Division III schools
BEGIN;

INSERT INTO public.schools (name, division)
VALUES
    -- NESCAC (New England Small College Athletic Conference)
    ('Hamilton College', 'III'),
    ('Connecticut College', 'III'),
    
    -- Centennial Conference
    ('Bryn Mawr College', 'III'),
    ('Dickinson College', 'III'),
    ('Franklin & Marshall College', 'III'),
    ('Gettysburg College', 'III'),
    ('Haverford College', 'III'),
    ('Johns Hopkins University', 'III'),
    ('McDaniel College', 'III'),
    ('Muhlenberg College', 'III'),
    ('Swarthmore College', 'III'),
    ('Ursinus College', 'III'),
    ('Washington College', 'III'),
    
    -- University Athletic Association
    ('Carnegie Mellon University', 'III'),
    ('Case Western Reserve University', 'III'),
    ('Emory University', 'III'),
    ('New York University', 'III'),
    ('University of Chicago', 'III'),
    ('University of Rochester', 'III'),
    ('Washington University in St. Louis', 'III'),
    
    -- Liberty League
    ('Clarkson University', 'III'),
    ('Hobart and William Smith Colleges', 'III'),
    ('Rensselaer Polytechnic Institute', 'III'),
    ('Rochester Institute of Technology', 'III'),
    ('St. Lawrence University', 'III'),
    ('Skidmore College', 'III'),
    ('Union College', 'III'),
    ('Vassar College', 'III'),
    
    -- NEWMAC (New England Women''s and Men''s Athletic Conference)
    ('Clark University', 'III'),
    ('Coast Guard Academy', 'III'),
    ('Springfield College', 'III'),
    ('Wheaton College', 'III'),
    ('Worcester Polytechnic Institute', 'III'),
    
    -- SUNYAC (State University of New York Athletic Conference)
    ('SUNY Brockport', 'III'),
    ('SUNY Cortland', 'III'),
    ('SUNY Fredonia', 'III'),
    ('SUNY Geneseo', 'III'),
    ('SUNY New Paltz', 'III'),
    ('SUNY Oneonta', 'III'),
    ('SUNY Oswego', 'III'),
    ('SUNY Plattsburgh', 'III'),
    ('SUNY Potsdam', 'III')
ON CONFLICT (name) DO NOTHING;

COMMIT; 