DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kalel') THEN
    CREATE USER kalel WITH PASSWORD 'krypton';
  END IF;
END $$;


CREATE DATABASE pennies OWNER kalel;
