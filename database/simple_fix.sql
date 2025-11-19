-- Simple fix: Drop all versions and create just one
DROP FUNCTION IF EXISTS get_share_by_code CASCADE;

-- Create function with _code parameter (what the code expects)
CREATE OR REPLACE FUNCTION get_share_by_code(_code TEXT)
RETURNS TABLE (
    id BIGINT,
    code VARCHAR,
    content_type VARCHAR,
    text_content TEXT,
    file_name VARCHAR,
    file_size BIGINT,
    file_url TEXT,
    view_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Increment view count
    UPDATE shares 
    SET view_count = view_count + 1 
    WHERE shares.code = UPPER(_code) 
    AND (shares.expires_at IS NULL OR shares.expires_at > NOW())
    AND shares.is_active = TRUE;
    
    -- Return the share record
    RETURN QUERY
    SELECT s.*
    FROM shares s
    WHERE s.code = UPPER(_code) 
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    AND s.is_active = TRUE;
END;
$$;
