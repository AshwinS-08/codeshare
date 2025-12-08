import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Lock, FileText, Activity, Database, Shield } from "lucide-react";

export default function ApiDocs() {
  const apiEndpoints = [
    {
      category: "Health & Status",
      icon: <Activity className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
      endpoints: [
        { method: "GET", path: "/", description: "Hello message", auth: false },
        { method: "GET", path: "/ping", description: "Pong response", auth: false },
        { method: "GET", path: "/health", description: "App health check", auth: false },
        { method: "GET", path: "/supabase/health", description: "Supabase connection status", auth: false },
      ]
    },
    {
      category: "Authentication",
      icon: <Lock className="w-5 h-5" />,
      color: "from-violet-500 to-purple-600",
      endpoints: [
        { 
          method: "POST", 
          path: "/api/auth/login", 
          description: "Login with email and password",
          auth: false,
          rateLimit: "5 per minute",
          body: { email: "user@example.com", password: "password123" },
          response: { access_token: "jwt_token", user: { id: "...", email: "..." } }
        },
        { 
          method: "POST", 
          path: "/api/auth/signup", 
          description: "Create new account",
          auth: false,
          rateLimit: "3 per hour",
          body: { email: "user@example.com", password: "password123" }
        },
        { method: "POST", path: "/api/auth/logout", description: "Logout", auth: true },
        { method: "GET", path: "/api/auth/user", description: "Get current user", auth: true },
      ]
    },
    {
      category: "Shares",
      icon: <FileText className="w-5 h-5" />,
      color: "from-pink-500 to-rose-600",
      endpoints: [
        { 
          method: "POST", 
          path: "/api/shares", 
          description: "Create a new share (file or text)",
          auth: false,
          rateLimit: "10 per minute",
          body: { text: "Hello world", password: "optional", metadata: {} }
        },
        { 
          method: "GET", 
          path: "/api/shares/<code>", 
          description: "Get share by code",
          auth: false,
          example: "/api/shares/ABC123?password=optional"
        },
      ]
    },
    {
      category: "User Dashboard",
      icon: <Database className="w-5 h-5" />,
      color: "from-amber-500 to-orange-600",
      endpoints: [
        { 
          method: "GET", 
          path: "/api/me/stats", 
          description: "Get user statistics (total shares, views)",
          auth: true,
          response: { total_shares: 42, total_views: 1247 }
        },
        { 
          method: "GET", 
          path: "/api/me/shares", 
          description: "Get all user's shares",
          auth: true
        },
        { 
          method: "GET", 
          path: "/api/me/analytics", 
          description: "Get detailed analytics data",
          auth: true,
          response: { 
            total_shares: 42, 
            total_views: 1247, 
            top_shares: [{ code: "ABC123", views: 89 }],
            content_types: { text: 10, file: 32 }
          }
        },
        { 
          method: "GET", 
          path: "/api/me/activity", 
          description: "Get recent activity feed",
          auth: true,
          response: { activities: [{ type: "share_created", action: "Created share" }] }
        },
      ]
    },
    {
      category: "Files",
      icon: <Shield className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-600",
      endpoints: [
        { 
          method: "GET", 
          path: "/api/files/fetch", 
          description: "Download/proxy file",
          auth: false,
          example: "/api/files/fetch?url=https://..."
        },
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500";
      case "POST": return "bg-green-500";
      case "PUT": return "bg-amber-500";
      case "DELETE": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete reference for all available API endpoints with examples and rate limits
          </p>
          
          {/* Quick Links */}
          <div className="flex justify-center gap-4 mt-6">
            <a 
              href="http://localhost:5000/docs/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Code className="w-4 h-4" />
              Open Swagger UI
            </a>
            <div className="px-4 py-2 bg-muted rounded-lg text-sm">
              Base URL: <code className="font-mono font-bold">http://localhost:5000</code>
            </div>
          </div>
        </div>

        {/* API Categories */}
        <div className="space-y-8">
          {apiEndpoints.map((category, idx) => (
            <Card 
              key={idx} 
              className="p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Category Header */}
              <div className={`flex items-center gap-3 mb-6 pb-4 border-b`}>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold">{category.category}</h2>
                <Badge variant="outline" className="ml-auto">
                  {category.endpoints.length} endpoints
                </Badge>
              </div>

              {/* Endpoints */}
              <div className="space-y-4">
                {category.endpoints.map((endpoint: any, endpointIdx) => (
                  <div 
                    key={endpointIdx}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    {/* Method and Path */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono font-bold flex-1">
                        {endpoint.path}
                      </code>
                      {endpoint.auth && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Auth Required
                        </Badge>
                      )}
                      {endpoint.rateLimit && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          ⚡ {endpoint.rateLimit}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {endpoint.description}
                    </p>

                    {/* Request Body */}
                    {endpoint.body && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">Request Body:</div>
                        <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Example */}
                    {endpoint.example && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">Example:</div>
                        <code className="bg-background p-2 rounded text-xs block">
                          {endpoint.example}
                        </code>
                      </div>
                    )}

                    {/* Response */}
                    {endpoint.response && (
                      <div>
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">Response:</div>
                        <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Rate Limiting Info */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            ⚡ Rate Limiting
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Global Limits:</strong> 50 requests per hour, 200 per day (per IP address)</p>
            <p><strong>Authentication:</strong> Use Bearer token in Authorization header</p>
            <p className="text-xs text-muted-foreground mt-2">
              Example: <code className="bg-background px-2 py-1 rounded">Authorization: Bearer eyJhbGc...</code>
            </p>
          </div>
        </Card>

        {/* Try it Out */}
        <Card className="p-8 mt-8 text-center bg-gradient-to-r from-violet-500/10 to-pink-500/10 border-violet-500/20">
          <h3 className="text-2xl font-bold mb-3">🚀 Try It Out!</h3>
          <p className="text-muted-foreground mb-4">
            Use the interactive Swagger UI to test all endpoints with a visual interface
          </p>
          <a 
            href="http://localhost:5000/docs/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:from-violet-700 hover:to-pink-700 transition-all shadow-lg"
          >
            <Code className="w-5 h-5" />
            Open Swagger Documentation
          </a>
        </Card>
      </div>
    </div>
  );
}
