# Supabase Setup Guide

This guide will help you set up the database and storage for your API application.

## Prerequisites
- A Supabase project (create one at https://supabase.com)
- Your Supabase URL and service role key from project settings

## Step 1: Database Table Setup

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the contents of `database/schema.sql` to create the shares table
4. Run the contents of `database/rls_policies.sql` to set up security policies

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply database migrations
supabase db push
```

## Step 2: Storage Bucket Setup

### Create the Storage Bucket
1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Create a bucket with these settings:
   - **Name**: `shared-files`
   - **Public bucket**: ✅ (enabled)
   - **File size limit**: 10MB (or as needed)
4. Click **Save**

### Apply Storage Policies
1. Go to **SQL Editor**
2. Run the contents of `database/storage_setup.sql`

## Step 3: Environment Configuration

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Verify Setup

### Test Database Connection
Run your Flask application and test the health endpoint:
```bash
curl http://localhost:5000/supabase/health
```

You should see a response like:
```json
{
  "configured": true,
  "url_present": true,
  "key_present": true,
  "key_type": "service",
  "client_created": true,
  "client_error": null,
  "auth": {"ok": true, "status": 200, "latency_ms": 123},
  "storage_buckets": {"attempted": true, "count": 1, "error": null},
  "status": "ok"
}
```

### Test File Upload
```bash
curl -X POST http://localhost:5000/api/shares \
  -F "text=Hello, World!"
```

## Step 5: Optional Enhancements

### Auto-expiration Function
Add this to your schema.sql to automatically expire old shares:

```sql
-- Function to clean up expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE shares 
    SET is_active = false 
    WHERE expires_at <= NOW() AND is_active = true;
END;
$$;

-- Create a cron job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-shares', '0 2 * * *', 'SELECT cleanup_expired_shares();');
```

### Share Statistics View
```sql
-- View for share statistics
CREATE VIEW share_stats AS
SELECT 
    COUNT(*) as total_shares,
    COUNT(CASE WHEN content_type = 'text' THEN 1 END) as text_shares,
    COUNT(CASE WHEN content_type = 'file' THEN 1 END) as file_shares,
    SUM(file_size) as total_file_size,
    AVG(view_count) as avg_views,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_shares
FROM shares;
```

## Troubleshooting

### "Bucket not found" Error
- Ensure the `shared-files` bucket exists in Storage
- Check that the bucket name matches exactly (case-sensitive)
- Verify your service role key has storage permissions

### RLS Policy Errors
- Ensure policies are created and enabled
- Check that your service role key has the correct permissions
- Verify the policies allow the operations you need

### Connection Issues
- Verify your Supabase URL is correct
- Check that your API keys are valid and not expired
- Ensure your network allows connections to Supabase

## Security Notes

1. **Never expose your service role key in client-side code**
2. **Use Row Level Security (RLS) to control data access**
3. **Set appropriate expiration times for shares**
4. **Monitor storage usage and set limits**
5. **Regularly clean up expired shares**

## Next Steps

Once setup is complete:
1. Test all API endpoints
2. Configure CORS if needed
3. Set up monitoring and logging
4. Deploy to production with proper environment variables
