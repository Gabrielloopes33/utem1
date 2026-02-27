-- Grant permissions for PostgREST roles on nexia schema
GRANT USAGE ON SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nexia TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
