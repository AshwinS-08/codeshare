-- Fix the RPC function
-- First drop the existing function
DROP FUNCTION IF EXISTS get_share_by_code(text);

-- Create the corrected function with proper column qualification
CREATE OR REPLACE FUNCTION get_share_by_code(share_code TEXT)
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
    -- Increment view count (qualify column names to avoid ambiguity)
    UPDATE shares 
    SET view_count = view_count + 1 
    WHERE shares.code = UPPER(share_code) 
    AND (shares.expires_at IS NULL OR shares.expires_at > NOW())
    AND shares.is_active = TRUE;
    
    -- Return the share record
    RETURN QUERY
    SELECT *
    FROM shares 
    WHERE shares.code = UPPER(share_code) 
    AND (shares.expires_at IS NULL OR shares.expires_at > NOW())
    AND shares.is_active = TRUE;
END;
$$;

-- Also create version with _code parameter for compatibility
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
    -- Increment view count (qualify column names to avoid ambiguity)
    UPDATE shares 
    SET view_count = view_count + 1 
    WHERE shares.code = UPPER(_code) 
    AND (shares.expires_at IS NULL OR shares.expires_at > NOW())
    AND shares.is_active = TRUE;
    
    -- Return the share record
    RETURN QUERY
    SELECT *
    FROM shares 
    WHERE shares.code = UPPER(_code) 
    AND (shares.expires_at IS NULL OR shares.expires_at > NOW())
    AND shares.is_active = TRUE;
END;
$$;
