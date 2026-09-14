# 🔗 Frontend-Supabase Integration Guide - Portal CDC UMK Kendari

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Data Flow Patterns](#data-flow-patterns)
- [Supabase Client Setup](#supabase-client-setup)
- [Authentication Integration](#authentication-integration)
- [Database Service Layer](#database-service-layer)
- [Real-time Subscriptions](#real-time-subscriptions)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

Portal CDC menggunakan **hybrid architecture** yang menggabungkan:
1. **Supabase Direct Access** - Frontend langsung query ke Supabase PostgreSQL
2. **Express.js Backend API** - Server middleware untuk logic kompleks + authentication
3. **Local Storage Fallback** - Cache data di browser untuk offline support

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│                 React 19 + TypeScript                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  Components                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │ │
│  │  │  Login   │  │Dashboard │  │ MitraDash│ ...       │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │ │
│  └───────┼─────────────┼─────────────┼──────────────────┘ │
│          │             │             │                     │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐ │
│  │         State Management (React Hooks)                │ │
│  │  - useState/useEffect                                 │ │
│  │  - Context API (optional)                            │ │
│  │  - Local State per Component                         │ │
│  └───────┬─────────────┬─────────────┬──────────────────┘ │
└──────────┼─────────────┼─────────────┼────────────────────┘
           │             │             │
           │ Path 1      │ Path 2      │ Path 3
           │ (Direct)    │ (via API)   │ (Fallback)
           │             │             │
┌──────────▼─────┐  ┌───▼──────────┐  ┌▼────────────────┐
│  Supabase JS   │  │ Express API  │  │ localStorage    │
│  Client        │  │ (server.js)  │  │ (Browser Cache) │
│  @supabase/    │  │              │  │                 │
│  supabase-js   │  │ Middleware:  │  │ Keys:           │
│                │  │ - JWT Auth   │  │ - cdc_users     │
│  Features:     │  │ - Bcrypt     │  │ - cdc_mahasiswa │
│  - .from()     │  │ - Rate Limit │  │ - cdc_lowongan  │
│  - .select()   │  │ - CORS       │  │ - cdc_session   │
│  - .insert()   │  │              │  │                 │
│  - .update()   │  │ Endpoints:   │  │ Auto-sync:      │
│  - .delete()   │  │ /api/login   │  │ Every mutation  │
│  - .subscribe()│  │ /api/all-data│  │                 │
└────────┬───────┘  └───┬──────────┘  └─────────────────┘
         │              │
         │ Prisma Client│
         │              │
┌────────▼──────────────▼─────────────────────────────────┐
│            Supabase PostgreSQL Database                 │
│  - Connection Pooler (Port 5432, Session Mode)         │
│  - Row Level Security (RLS) Policies                   │
│  - Real-time Replication                               │
│  - Automatic Backups                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Patterns

### Pattern 1: Direct Supabase Query (Fast, Type-safe)

**Use Case:** Simple CRUD operations, real-time subscriptions

```typescript
// src/components/MahasiswaDashboard.tsx
import { supabase } from '../supabaseClient';

const mahasiswa = await supabase
  .from('mahasiswa')
  .select('*, user:users(*)')
  .eq('userId', currentUser.id)
  .single();
```

**Flow:**
```
Component → Supabase Client → PostgreSQL → Response → State Update
```

**Advantages:**
- ✅ Fastest (no middleware overhead)
- ✅ Type-safe with TypeScript
- ✅ Real-time subscriptions available
- ✅ Automatic connection pooling

**When to Use:**
- Read operations (SELECT)
- Real-time data (subscriptions)
- Simple inserts/updates without business logic

---

### Pattern 2: Express API Backend (Secure, Business Logic)

**Use Case:** Authentication, password hashing, complex queries

```typescript
// src/App.tsx - Login
const response = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const result = await response.json();
localStorage.setItem('cdc_auth_token', result.token);
```

**Flow:**
```
Component → fetch() → Express API → Prisma → PostgreSQL 
         → JWT Token → localStorage → State Update
```

**Advantages:**
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token generation
- ✅ Rate limiting protection
- ✅ Business logic centralization

**When to Use:**
- Authentication (login, logout)
- Password operations
- Complex business logic
- Data aggregation across multiple tables

---

### Pattern 3: LocalStorage Fallback (Offline-first)

**Use Case:** Offline support, initial load optimization

```typescript
// src/data.ts - Database Utilities
export const initializeDB = () => {
  if (localStorage.getItem('cdc_seed_version') !== CURRENT_SEED_VERSION) {
    // Seed fresh data
    Object.entries(SEED_STORAGE).forEach(([storageKey, val]) => {
      localStorage.setItem(storageKey, JSON.stringify(val));
    });
    localStorage.setItem('cdc_seed_version', CURRENT_SEED_VERSION);
  }
};

export const getFromDB = <T>(table: string): T[] => {
  const storageKey = `cdc_${table}`;
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : [];
};
```

**Flow:**
```
Component → getFromDB() → localStorage → Parse JSON → Return Data
```

**Advantages:**
- ✅ Instant load (no network)
- ✅ Offline capability
- ✅ Reduced API calls

**When to Use:**
- Initial app load
- Offline mode
- Development/testing without backend
- Caching frequently accessed data

---

## 🔌 Supabase Client Setup

### 1. Environment Variables

**.env (Root Directory)**
```bash
# Supabase Connection
VITE_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Backend-only (server.js)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Why VITE_ prefix?**
- Vite only exposes env vars with `VITE_` prefix to browser
- Prevents accidental exposure of server-only secrets
- `SUPABASE_SERVICE_ROLE_KEY` stays server-side only

---

### 2. Supabase Client Initialization

**src/supabaseClient.ts**
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const meta = import.meta as any;

// Try multiple sources (Vite, Node, process.env)
const supabaseUrl =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  (typeof meta !== 'undefined' && meta.env && meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase Client] VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus di-set. ' +
    'Salin .env.example ke .env dan isi credentials dari Supabase Dashboard.'
  );
}

// Create singleton client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
```

**Key Points:**
- ✅ Singleton pattern (one client instance)
- ✅ Multi-source env variable resolution
- ✅ Validation with helpful error messages
- ✅ Auto-reconnect on network issues

---

### 3. Type-safe Database Types (Optional but Recommended)

Generate TypeScript types from Supabase schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
npx supabase gen types typescript --project-id [PROJECT-REF] > src/types/supabase.ts
```

**Usage:**
```typescript
import { Database } from './types/supabase';

const { data, error } = await supabase
  .from('mahasiswa')
  .select('*')
  .returns<Database['public']['Tables']['mahasiswa']['Row']>();
```

---

## 🔐 Authentication Integration

### Login Flow (Hybrid: API + Supabase)

**Step-by-Step:**

#### 1. User Submits Credentials
```typescript
// src/App.tsx:120-160
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError('');

  if (!loginEmail || !loginPassword) {
    setLoginError('Email dan Password wajib diisi.');
    return;
  }

  try {
    // Call Express API for authentication
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: loginEmail.toLowerCase(), 
        password: loginPassword 
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setLoginError(result.message || 'Login gagal.');
      return;
    }

    // Store JWT token + metadata
    localStorage.setItem('cdc_auth_token', result.token);
    localStorage.setItem('cdc_token_expiry', (Date.now() + result.expiresIn * 1000).toString());
    localStorage.setItem('cdc_session_id', result.user.id);

    // Update React state
    setCurrentUser(result.user);
    setCurrentView('dashboard');
    reloadDatabase();
  } catch (error) {
    console.error('[Login Error]:', error);
    setLoginError('Tidak dapat terhubung ke server.');
  }
};
```

#### 2. Backend Validates & Returns JWT
```javascript
// server.js:157-222
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ 
      success: false, 
      message: 'Email atau password salah.' 
    });
  }

  // Verify password with bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ 
      success: false, 
      message: 'Email atau password salah.' 
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate JWT token (24h expiry)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return user WITHOUT password
  const { password: _, ...userWithoutPassword } = user;

  res.json({ 
    success: true, 
    user: userWithoutPassword,
    token,
    expiresIn: 86400 // 24 hours in seconds
  });
});
```

#### 3. Frontend Stores Token & User State
```typescript
// localStorage structure:
{
  "cdc_auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cdc_token_expiry": "1693911296000",  // Unix timestamp
  "cdc_session_id": "usr_admin"
}

// React state:
const [currentUser, setCurrentUser] = useState<UserType | null>(result.user);
```

#### 4. Subsequent API Calls Include Token
```typescript
// Protected endpoint request
const response = await fetch('http://localhost:5000/api/all-data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('cdc_auth_token')}`
  }
});
```

#### 5. Token Validation Middleware
```javascript
// server.js:76-91
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user; // {id, email, role}
    next();
  });
};

// Apply to protected routes
app.get('/api/all-data', authenticateToken, apiLimiter, async (req, res) => {
  // req.user is now available
  // ...
});
```

---

### Auto-Logout on Token Expiry

**Implementation:**
```typescript
// src/App.tsx - useEffect hook
useEffect(() => {
  const checkTokenExpiry = () => {
    const expiry = localStorage.getItem('cdc_token_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      // Token expired
      localStorage.removeItem('cdc_auth_token');
      localStorage.removeItem('cdc_token_expiry');
      localStorage.removeItem('cdc_session_id');
      setCurrentUser(null);
      setCurrentView('home');
      alert('Session Anda telah berakhir. Silakan login kembali.');
    }
  };

  // Check every minute
  const interval = setInterval(checkTokenExpiry, 60000);
  return () => clearInterval(interval);
}, []);
```

---

## 💾 Database Service Layer

### Service Pattern (Abstraction Layer)

**src/services/dbService.ts**
```typescript
const API_BASE_URL = 'http://localhost:5000/api';

export const dbService = {
  // Fetch all data (authenticated)
  async getAllData() {
    const token = localStorage.getItem('cdc_auth_token');
    const response = await fetch(`${API_BASE_URL}/all-data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Sync entity to database
  async syncEntity(entity: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/sync/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete record
  async deleteRecord(table: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/${table}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return response.json();
  }
};
```

**Usage in Components:**
```typescript
// src/components/AdminDashboard.tsx
import { dbService } from '../services/dbService';

const handleDeleteLowongan = async (id: string) => {
  try {
    await dbService.deleteRecord('lowongan', id);
    // Update local state
    setLowongan(prev => prev.filter(l => l.id !== id));
    alert('Lowongan berhasil dihapus');
  } catch (error) {
    console.error('Delete error:', error);
    alert('Gagal menghapus lowongan');
  }
};
```

---

### Direct Supabase Queries (Alternative)

**For Simple CRUD:**
```typescript
// SELECT
const { data, error } = await supabase
  .from('mahasiswa')
  .select('*')
  .eq('userId', currentUser.id)
  .single();

if (error) {
  console.error('Query error:', error);
  return;
}

// INSERT
const { data: newMahasiswa, error: insertError } = await supabase
  .from('mahasiswa')
  .insert({
    userId: currentUser.id,
    nim: '202101001',
    nama: 'John Doe',
    programStudi: 'Teknik Informatika',
    fakultas: 'Fakultas Teknik',
    angkatan: '2021'
  })
  .select()
  .single();

// UPDATE
const { error: updateError } = await supabase
  .from('mahasiswa')
  .update({ semester: 5 })
  .eq('id', mahasiswaId);

// DELETE
const { error: deleteError } = await supabase
  .from('mahasiswa')
  .delete()
  .eq('id', mahasiswaId);
```

---

## 🔴 Real-time Subscriptions

### Subscribe to Table Changes

**Pattern:**
```typescript
useEffect(() => {
  // Subscribe to lowongan changes
  const subscription = supabase
    .channel('lowongan_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT | UPDATE | DELETE
        schema: 'public',
        table: 'lowongan'
      },
      (payload) => {
        console.log('Change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          setLowongan(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setLowongan(prev => 
            prev.map(l => l.id === payload.new.id ? payload.new : l)
          );
        } else if (payload.eventType === 'DELETE') {
          setLowongan(prev => 
            prev.filter(l => l.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();

  // Cleanup on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Use Cases:**
- Real-time job board updates
- Live application status changes
- Collaborative editing
- Notifications

---

## 🎛️ State Management

### Option 1: Component-level State (Current Implementation)

```typescript
// src/App.tsx
const [currentUser, setCurrentUser] = useState<UserType | null>(null);
const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
const [lowongan, setLowongan] = useState<Lowongan[]>([]);
const [currentView, setCurrentView] = useState<string>('home');

// Pass down via props
<AdminDashboard 
  currentUser={currentUser}
  lowongan={lowongan}
  setLowongan={setLowongan}
/>
```

**Pros:**
- ✅ Simple, no extra dependencies
- ✅ Easy to understand
- ✅ Good for small-medium apps

**Cons:**
- ❌ Prop drilling
- ❌ Re-renders parent on every state change

---

### Option 2: Context API (Recommended for Scale)

**Create AuthContext:**
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  currentUser: UserType | null;
  login: (user: UserType, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const login = (user: UserType, token: string) => {
    localStorage.setItem('cdc_auth_token', token);
    localStorage.setItem('cdc_session_id', user.id);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('cdc_auth_token');
    localStorage.removeItem('cdc_token_expiry');
    localStorage.removeItem('cdc_session_id');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Usage:**
```typescript
// src/main.tsx
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Any component
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🚨 Error Handling

### Network Error Handling

```typescript
const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('cdc_auth_token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok && i < retries - 1) {
        // Retry on 5xx errors
        if (response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
};
```

---

### Supabase Error Handling

```typescript
const { data, error } = await supabase
  .from('mahasiswa')
  .select('*')
  .eq('userId', userId)
  .single();

if (error) {
  // Handle specific Supabase errors
  switch (error.code) {
    case 'PGRST116': // No rows returned
      console.warn('Mahasiswa not found');
      return null;
    
    case '23505': // Unique constraint violation
      alert('NIM sudah terdaftar');
      return;
    
    case '23503': // Foreign key violation
      alert('User ID tidak valid');
      return;
    
    default:
      console.error('Supabase error:', error);
      alert('Terjadi kesalahan database');
      return;
  }
}
```

---

## ✅ Best Practices

### 1. Connection Management
```typescript
// ✅ GOOD: Reuse single client instance
import { supabase } from './supabaseClient';

// ❌ BAD: Create new client every time
const supabase = createClient(url, key); // DON'T DO THIS
```

### 2. Query Optimization
```typescript
// ✅ GOOD: Select only needed columns
const { data } = await supabase
  .from('mahasiswa')
  .select('id, nama, nim, email')
  .eq('userId', userId);

// ❌ BAD: Select all columns unnecessarily
const { data } = await supabase
  .from('mahasiswa')
  .select('*'); // Fetches everything
```

### 3. Error Boundaries
```typescript
// Wrap components with error boundary
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  fallback={<div>Something went wrong. Please refresh.</div>}
  onError={(error) => console.error('Error:', error)}
>
  <Dashboard />
</ErrorBoundary>
```

### 4. Loading States
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await dbService.getAllData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

if (loading) return <LoadingSpinner />;
if (!data) return <ErrorMessage />;
return <DataView data={data} />;
```

### 5. Security Headers
```typescript
// Always include auth token
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('cdc_auth_token')}`
};
```

---

## 🔗 Related Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database schema
- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Backend API
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Security audit

---

**Last Updated:** September 4, 2026  
**Frontend:** React 19 + Vite 6  
**Backend:** Express.js 4.21 + Prisma 6.12  
**Database:** Supabase PostgreSQL 15+
