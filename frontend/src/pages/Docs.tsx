import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Docs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-5xl space-y-10 md:space-y-12">
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Project documentation
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
            Overview of the CodeShare application: frontend pages, user flows, and backend API
            endpoints used for creating, retrieving, and downloading shares.
          </p>
        </header>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-3">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="infra" className="hidden md:inline-flex">Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6 space-y-4">
            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Home / Index</h2>
              <p className="text-sm text-muted-foreground">
                Entry point of the app at <code className="font-mono text-xs">/</code>. Provides the
                main hero section, feature highlights, and the core sharing interface.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Contains the <code className="font-mono text-xs">Share</code> component to create new
                  shares (file or text).
                </li>
                <li>
                  Contains the <code className="font-mono text-xs">Retrieve</code> component to fetch
                  existing shares by code.
                </li>
                <li>
                  Shows feature cards: <strong>Easy Sharing</strong>, <strong>Quick Access</strong>, and
                  <strong>Secure &amp; Private</strong>.
                </li>
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">ShareView</h2>
              <p className="text-sm text-muted-foreground">
                Detail view for a specific share at
                <code className="font-mono text-xs"> /share/:code</code>. Fetches share data from the
                backend and renders either text content or file information.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Displays share metadata: code, views, expiry countdown.</li>
                <li>
                  For text shares, shows the content in a styled code-like block with a "Copy Text"
                  action.
                </li>
                <li>
                  For file shares, shows file name, size, and a <strong>Download</strong> action and
                  attempts an inline preview (image / PDF / limited text).
                </li>
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">HowItWorks</h2>
              <p className="text-sm text-muted-foreground">
                Explains the application in a simple three-step flow at
                <code className="font-mono text-xs"> /how-it-works</code>.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Step 1: Create a share (upload file or paste text, generate a code).</li>
                <li>Step 2: Share the code with others.</li>
                <li>Step 3: Auto-expiration after 24 hours for security and cleanup.</li>
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Private area for authenticated users at <code className="font-mono text-xs">/dashboard</code>.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Displays user statistics (total shares, total views).
                </li>
                <li>
                  Lists all active shares created by the user with options to preview, copy link, or download.
                </li>
              </ul>
            </Card>

            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">NotFound</h2>
              <p className="text-sm text-muted-foreground">
                Fallback page for unknown routes. Shown when no route matches the URL.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Displays a 404 message and a button to return to the home page
                  (<code className="font-mono text-xs">/</code>).
                </li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6 space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Base &amp; health endpoints</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /</code>
                  </p>
                  <p>Simple hello endpoint used mainly for connectivity checks.</p>
                </div>
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /ping</code>
                  </p>
                  <p>Returns a <code>pong</code> payload. Useful for basic uptime checks.</p>
                </div>
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /health</code>
                  </p>
                  <p>Reports basic service health.</p>
                </div>
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /supabase/health</code>
                  </p>
                  <p>
                    Performs a deeper Supabase connectivity check, including auth health and optional
                    bucket listing when a service key is configured.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Share endpoints</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p>
                    <code className="font-mono text-xs">POST /api/shares</code>
                  </p>
                  <p className="mb-1">Create a new share.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Accepts <code>multipart/form-data</code> with optional <code>file</code> and
                      <code>text</code> fields, or JSON <code>{'{ text: string, code?: string }'}</code>.
                    </li>
                    <li>Uploads files to the Supabase storage bucket and stores metadata in the</li>
                    <li>
                      Returns the generated code, content type, and file/text metadata on success
                      (<code>201 Created</code>).
                    </li>
                  </ul>
                </div>

                <div>
                  <p>
                    <code className="font-mono text-xs">GET /api/shares/&lt;code&gt;</code>
                  </p>
                  <p className="mb-1">Retrieve a share by its unique code.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Prefers an RPC call (<code>rpc_get_share_by_code</code>) to enforce business
                      logic such as expiry and view counting.
                    </li>
                    <li>
                      Falls back to a direct <code>select</code> on the <code>shares</code> table if the
                      RPC is unavailable.
                    </li>
                    <li>Returns <code>404</code> when the share is missing or expired.</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">User endpoints</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /api/me/stats</code>
                  </p>
                  <p className="mb-1">Get statistics for the authenticated user.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Requires <code>Authorization: Bearer &lt;token&gt;</code> header.</li>
                    <li>Returns total number of shares and total views across all shares.</li>
                  </ul>
                </div>

                <div>
                  <p>
                    <code className="font-mono text-xs">GET /api/me/shares</code>
                  </p>
                  <p className="mb-1">List all shares for the authenticated user.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Requires <code>Authorization: Bearer &lt;token&gt;</code> header.</li>
                    <li>Returns a list of shares with metadata (code, filename, views, etc.).</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">File fetch endpoint</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p>
                    <code className="font-mono text-xs">GET /api/files/fetch?url=...</code>
                  </p>
                  <p className="mb-1">
                    Backend proxy for downloading files without exposing Supabase storage URLs
                    directly to the client.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Supports regular public URLs as well as <code>proxy:bucket/path</code> format,
                      where the backend generates a signed URL or downloads via the Supabase client.
                    </li>
                    <li>
                      Validates that the host matches the configured <code>SUPABASE_URL</code> domain
                      when using public URLs.
                    </li>
                    <li>
                      Returns file bytes with appropriate <code>Content-Type</code> and optionally
                      <code>Content-Disposition</code> headers for downloads.
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="infra" className="mt-6 space-y-4">
            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">Configuration &amp; environment</h2>
              <p className="text-sm text-muted-foreground">
                The backend configuration is defined in
                <code className="font-mono text-xs"> backend/config.py</code> and environment
                variables loaded via <code>.env</code>.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Supabase</strong>:
                  <code className="font-mono text-xs">SUPABASE_URL</code>,
                  <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>, and
                  related keys configure DB and storage access.
                </li>
                <li>
                  <strong>File uploads</strong>: <code className="font-mono text-xs">MAX_FILE_SIZE</code>
                  and allowed extensions control upload limits and types.
                </li>
                <li>
                  <strong>Shares</strong>: expiry windows and code length are customizable via config
                  constants.
                </li>
                <li>
                  <strong>CORS</strong>:
                  <code className="font-mono text-xs">CORS_ORIGINS</code> controls which frontend
                  origins may call the API.
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Docs;
