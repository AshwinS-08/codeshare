-- Final fix for RPC function with proper column qualification
DROP FUNCTION IF EXISTS get_share_by_code CASCADE;

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
    -- Increment view count with fully qualified column names
    UPDATE shares s
    SET view_count = s.view_count + 1 
    WHERE s.code = UPPER(_code) 
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    AND s.is_active = TRUE;
    
    -- Return the share record with fully qualified columns
    RETURN QUERY
    SELECT 
        s.id,
        s.code,
        s.content_type,
        s.text_content,
        s.file_name,
        s.file_size,
        s.file_url,
        s.view_count,
        s.created_at,
        s.expires_at,
        s.is_active
    FROM shares s
    WHERE s.code = UPPER(_code) 
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    AND s.is_active = TRUE;
END;
$$;
