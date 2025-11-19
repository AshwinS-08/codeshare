-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on shares table
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to read active, non-expired shares
CREATE POLICY "Allow anonymous read access to active shares"
ON shares FOR SELECT
USING (
    is_active = TRUE 
    AND (expires_at IS NULL OR expires_at > NOW())
);

-- Policy: Allow service role to insert new shares
CREATE POLICY "Allow service role to insert shares"
ON shares FOR INSERT
WITH CHECK (
    -- Service role can insert any valid share
    code IS NOT NULL 
    AND content_type IN ('text', 'file')
    AND (content_type = 'text' OR (content_type = 'file' AND file_name IS NOT NULL))
);

-- Policy: Allow service role to update shares (for view count, etc.)
CREATE POLICY "Allow service role to update shares"
ON shares FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Allow service role to delete shares
CREATE POLICY "Allow service role to delete shares"
ON shares FOR DELETE
USING (true);
