# 📝 How Code/Text Sharing Works - Complete Flow

## 🎯 Quick Example: Sharing Your Java Code

Let's trace what happens when you share this code:

```java
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SHARES CODE                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User Pastes Code in Frontend                           │
│  ─────────────────────────────────────────                       │
│  Location: frontend/src/components/Share.tsx                     │
│                                                                  │
│  • User pastes Java code into <Textarea>                        │
│  • Text stored in state: setText(code)                          │
│  • Character count displayed: "text.length characters"          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: User Clicks "Upload & Share" Button                    │
│  ─────────────────────────────────────────                       │
│  • handleShare() function is called                             │
│  • Validation: Check if text is not empty                       │
│  • Generate random 6-character code (e.g., "ABC123")            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: API Call to Backend                                    │
│  ─────────────────────────────────────────────                   │
│  Location: frontend/src/services/apiService.ts                   │
│                                                                  │
│  POST /api/shares                                               │
│  Body: {                                                        │
│    text: "public class Main { ... }",                           │
│    code: "ABC123"  // optional, backend can generate            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Backend Processes Request                              │
│  ─────────────────────────────────────────                       │
│  Location: backend/application.py (line 245)                     │
│                                                                  │
│  @application.route("/api/shares", methods=["POST"])            │
│  def create_share():                                            │
│      # Extract text from request                                │
│      body = request.get_json()                                  │
│      text_content = body.get("text")                            │
│      code = body.get("code") or _generate_code()                │
│                                                                  │
│      # Create database record                                   │
│      payload = {                                                │
│          "code": "ABC123",                                      │
│          "content_type": "text",                                │
│          "text_content": "public class Main { ... }",           │
│          "user_id": user_id  // if logged in                    │
│      }                                                          │
│                                                                  │
│      # Insert into Supabase database                            │
│      client.table("shares").insert(payload).execute()           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Database Storage (Supabase)                            │
│  ─────────────────────────────────────────                       │
│  Table: shares                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ id          │ uuid (auto-generated)            │            │
│  │ code        │ "ABC123"                         │            │
│  │ content_type│ "text"                           │            │
│  │ text_content│ "public class Main { ... }"      │            │
│  │ created_at  │ 2025-11-28 14:13:58             │            │
│  │ expires_at  │ 2025-11-29 14:13:58 (24h later) │            │
│  │ view_count  │ 0                                │            │
│  │ user_id     │ user-uuid (if logged in)         │            │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Backend Returns Response                               │
│  ─────────────────────────────────────────                       │
│  Response (JSON):                                               │
│  {                                                              │
│    "code": "ABC123",                                            │
│    "content_type": "text",                                      │
│    "text_content": "public class Main { ... }",                 │
│    "status": "ok"                                               │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Frontend Displays Share Code                           │
│  ─────────────────────────────────────────────                   │
│  Location: frontend/src/components/CodeDisplay.tsx              │
│                                                                  │
│  • Shows large code: "ABC123"                                   │
│  • Displays share link: yourapp.com/share/ABC123                │
│  • Copy button to copy link                                     │
│  • QR code option (NEW!)                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOMEONE RETRIEVES CODE                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: User Visits Share Link                                 │
│  ─────────────────────────────────────────────                   │
│  URL: yourapp.com/share/ABC123                                  │
│                                                                  │
│  • React Router matches route: /share/:code                     │
│  • ShareView component loads                                    │
│  • Extracts code from URL params: useParams()                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: Frontend Fetches Share Data                            │
│  ─────────────────────────────────────────────                   │
│  Location: frontend/src/pages/ShareView.tsx                     │
│                                                                  │
│  GET /api/shares/ABC123                                         │
│                                                                  │
│  useEffect(() => {                                              │
│    const data = await apiService.getShareByCode("ABC123");      │
│    setShareData(data);                                          │
│  }, [code]);                                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: Backend Retrieves from Database                       │
│  ─────────────────────────────────────────────                   │
│  Location: backend/application.py (line 421)                     │
│                                                                  │
│  @application.route("/api/shares/<code>", methods=["GET"])      │
│  def get_share(code: str):                                      │
│      # Query database                                           │
│      resp = client.table("shares")                              │
│                   .select("*")                                  │
│                   .eq("code", "ABC123")                         │
│                   .execute()                                    │
│                                                                  │
│      # Increment view count                                     │
│      # Check if expired                                         │
│      # Return share data                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 11: Display Code to Viewer                                │
│  ─────────────────────────────────────────────                   │
│  Location: frontend/src/pages/ShareView.tsx                     │
│                                                                  │
│  ┌──────────────────────────────────────────────┐              │
│  │  Shared Content                              │              │
│  │  Code: ABC123                                │              │
│  │  ────────────────────────────────────────    │              │
│  │  Text Content                                │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │ public class Main {                    │ │              │
│  │  │   public static void main(String[] a) {│ │              │
│  │  │     System.out.println("Hello World"); │ │              │
│  │  │   }                                    │ │              │
│  │  │ }                                      │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  │  [Copy Text]                                │              │
│  └──────────────────────────────────────────────┘              │
│                                                                  │
│  • Syntax highlighting (if using CodeEditor component)          │
│  • Copy button to copy code                                     │
│  • View count displayed                                         │
│  • Time remaining shown                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Implementation Details

### 1. **Frontend Share Component** (`Share.tsx`)

```typescript
// When user clicks "Upload & Share"
const handleShare = async () => {
  // Validation
  if (!file && !text.trim()) {
    toast({ title: "Nothing to share" });
    return;
  }

  setIsGenerating(true);
  
  try {
    // Generate random code
    const code = generateCode(); // Returns "ABC123"
    
    // Call backend API
    const res = await apiService.createShare({ text });
    
    // Show success
    setGeneratedCode(res.code);
    toast({ title: "Content uploaded!" });
  } catch (error) {
    toast({ title: "Upload failed", variant: "destructive" });
  } finally {
    setIsGenerating(false);
  }
};
```

### 2. **API Service** (`apiService.ts`)

```typescript
export const apiService = {
  async createShare(data: { text?: string; file?: File }) {
    const formData = new FormData();
    
    if (data.text) {
      formData.append('text', data.text);
    }
    
    if (data.file) {
      formData.append('file', data.file);
    }
    
    const response = await fetch(`${API_BASE}/api/shares`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}` // if logged in
      }
    });
    
    return await response.json();
  },
  
  async getShareByCode(code: string) {
    const response = await fetch(`${API_BASE}/api/shares/${code}`);
    return await response.json();
  }
};
```

### 3. **Backend Create Share** (`application.py`)

```python
@application.route("/api/shares", methods=["POST"]) 
def create_share():
    # Get data from request
    if request.content_type.startswith("multipart/form-data"):
        code = request.form.get("code") or _generate_code()
        text_content = request.form.get("text") or None
        uploaded = request.files.get("file")
    else:
        body = request.get_json()
        code = body.get("code") or _generate_code()
        text_content = body.get("text") or None
    
    # Determine content type
    content_type = "file" if uploaded else "text"
    
    # Create database record
    payload = {
        "code": code,
        "content_type": content_type,
        "text_content": text_content,
        "user_id": user_id  # if authenticated
    }
    
    # Insert into database
    resp = client.table("shares").insert(payload).execute()
    
    # Return response
    return jsonify({
        "code": code,
        "content_type": content_type,
        "text_content": text_content,
        "status": "ok"
    }), 201
```

### 4. **Backend Get Share** (`application.py`)

```python
@application.route("/api/shares/<code>", methods=["GET"])
def get_share(code: str):
    # Query database
    resp = client.table("shares")\
                .select("*")\
                .eq("code", code.upper())\
                .limit(1)\
                .execute()
    
    data = getattr(resp, "data", [])
    
    if not data:
        return jsonify({"error": "Not found"}), 404
    
    # Increment view count
    share_id = data[0]["id"]
    current_views = data[0]["view_count"]
    
    client.table("shares")\
          .update({"view_count": current_views + 1})\
          .eq("id", share_id)\
          .execute()
    
    return jsonify(data[0]), 200
```

### 5. **Frontend ShareView** (`ShareView.tsx`)

```typescript
export default function ShareView() {
  const { code } = useParams<{ code: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  
  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const data = await apiService.getShareByCode(code);
        setShareData(data);
      } catch (err) {
        setError('Failed to load share');
      }
    };
    
    fetchShareData();
  }, [code]);
  
  return (
    <div>
      <h1>Shared Content</h1>
      <p>Code: {shareData?.code}</p>
      
      {shareData?.content_type === 'text' && (
        <Card>
          <pre>{shareData.text_content}</pre>
          <Button onClick={copyText}>Copy Text</Button>
        </Card>
      )}
    </div>
  );
}
```

---

## 🔐 Database Schema

```sql
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL,  -- 'text' or 'file'
    text_content TEXT,            -- For text shares
    file_name TEXT,               -- For file shares
    file_size INTEGER,            -- File size in bytes
    file_url TEXT,                -- URL to file in storage
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
    view_count INTEGER DEFAULT 0,
    max_views INTEGER,
    user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_shares_code ON shares(code);
CREATE INDEX idx_shares_user_id ON shares(user_id);
```

---

## 🎯 Code Splitting (Lazy Loading)

### What is Code Splitting?

Code splitting means breaking your JavaScript bundle into smaller chunks that load on-demand, rather than loading everything upfront.

### How It Works in This App:

```typescript
// Instead of:
import Dashboard from './pages/Dashboard';

// We use:
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Implementation in `App.tsx`:

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShareView = lazy(() => import('./pages/ShareView'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/share/:code" element={<ShareView />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Benefits:

1. **Faster Initial Load**: Only loads the home page code initially
2. **On-Demand Loading**: Dashboard code only loads when user visits `/dashboard`
3. **Smaller Bundles**: Each route gets its own JavaScript file
4. **Better Performance**: Users only download what they need

### Bundle Structure:

```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js       (Main app code)
│   ├── Dashboard-def456.js   (Dashboard page - lazy loaded)
│   ├── ShareView-ghi789.js   (ShareView page - lazy loaded)
│   ├── Login-jkl012.js       (Login page - lazy loaded)
│   └── vendor-mno345.js      (Third-party libraries)
```

---

## 🚀 Performance Optimization

### 1. **Component-Level Code Splitting**

```typescript
// Heavy components can also be lazy loaded
const AnalyticsChart = lazy(() => import('./components/AnalyticsChart'));
const QRCodeGenerator = lazy(() => import('./components/QRCodeGenerator'));

// Only load when needed
{showAnalytics && (
  <Suspense fallback={<Skeleton />}>
    <AnalyticsChart />
  </Suspense>
)}
```

### 2. **Route-Based Splitting**

Already implemented in the app - each page is a separate chunk.

### 3. **Library Splitting**

```typescript
// Vite automatically splits large libraries
import { Chart } from 'recharts';  // Loaded only when needed
import QRCodeStyling from 'qr-code-styling';  // Loaded only when needed
```

---

## 📊 Example: Your Java Code Journey

```
1. You paste Java code → Frontend state
2. Click "Upload & Share" → API call
3. Backend generates "ABC123" → Database insert
4. Frontend shows "ABC123" → User copies link
5. Friend visits yourapp.com/share/ABC123
6. Frontend fetches data → Backend queries DB
7. Java code displayed → Friend can copy it
```

---

## 🎨 New Features Integration

### With Code Editor Component:

```typescript
import { CodeEditor } from '@/components/CodeEditor';

<CodeEditor 
  value={javaCode}
  onChange={setJavaCode}
  theme="dark"
/>
```

This gives you:
- Syntax highlighting for Java
- Line numbers
- Multiple themes
- Live preview
- Character/line count

### With QR Code:

```typescript
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

<QRCodeGenerator 
  url={`${window.location.origin}/share/ABC123`}
  title="Scan to View Code"
/>
```

This generates a QR code that anyone can scan to view your Java code!

---

## 🔒 Security Features

1. **Auto-Expiry**: Shares deleted after 24 hours
2. **View Limits**: Optional max views (coming soon)
3. **Password Protection**: Optional password (coming soon)
4. **One-Time View**: Self-destruct after viewing (coming soon)

---

## 📱 Access Methods

Users can access shared code via:

1. **Direct Link**: `yourapp.com/share/ABC123`
2. **Code Entry**: Enter "ABC123" in "Get Content" tab
3. **QR Code**: Scan QR code with phone
4. **Dashboard**: View all your shares (if logged in)

---

**That's the complete flow!** Your Java code goes from your clipboard → database → anyone's screen in seconds! 🚀
