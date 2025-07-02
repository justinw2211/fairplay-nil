-- Create a function to run migrations safely
CREATE OR REPLACE FUNCTION run_migration(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 