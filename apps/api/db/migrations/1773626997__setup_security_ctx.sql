-- public_id: opaque external-facing UUID for all public-facing tables.
-- Never expose the internal `id` (UUIDv7) directly to clients.
CREATE DOMAIN IF NOT EXISTS pub_id AS UUID NOT NULL DEFAULT gen_random_uuid();


CREATE OR REPLACE FUNCTION current_app_user_id () RETURNS UUID LANGUAGE plpgsql STABLE PARALLEL SAFE AS $$
DECLARE
    is_test     BOOL;
    raw_id      TEXT;
BEGIN
    is_test := COALESCE(current_setting('app.is_test_db', true), 'false')::BOOL;

    -- never throws, returns NULL if unset
    raw_id := current_setting('app.current_user_id', true);

    IF raw_id IS NOT NULL AND length(raw_id) > 0 THEN
        -- validate it's a real UUID regardless of test/prod
        BEGIN
            RETURN raw_id::UUID;
        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE EXCEPTION
                    'app.current_user_id is not a valid UUID: %', raw_id
                    USING ERRCODE = 'invalid_parameter_value';
        END;
    END IF;

    -- raw_id is NULL or empty at this point
    IF is_test THEN
        RETURN '00000000-0000-0000-0000-000000000001'::UUID;
    END IF;

    RAISE EXCEPTION
        'app.current_user_id is not set — unauthenticated DB access blocked'
        USING ERRCODE = 'insufficient_privilege';
END;
$$;
