# Phase 5: Integration & API Connectivity - Completion Documentation

Status: ✅ COMPLETE
Date: August 2, 2026
Project: Credit Union Member Churn Prediction System

1. Overview

Phase 5 successfully connected the Next.js 14 frontend dashboard to the FastAPI backend API. All five main pages now fetch and display real data from the backend, with proper error handling, loading states, and user feedback mechanisms.

Key Metrics:

5 pages fully integrated
8 API endpoints connected
Real data flowing end-to-end
Error handling on all pages
Timeout warnings implemented
2. Architecture Overview
2.1 System Architecture

┌─────────────────────────────────────────┐
│     Frontend (Next.js 14 + React)       │
│     http://localhost:3000               │
├─────────────────────────────────────────┤
│  Pages:                                 │
│  • Dashboard (/)                        │
│  • Members (/members)                   │
│  • Member Profile (/members/[id])       │
│  • Bulk Upload (/upload)                │
│  • Reports (/reports)                   │
└────────────────┬────────────────────────┘
                 │
          HTTPS/Axios Calls
                 │
                 ▼
┌─────────────────────────────────────────┐
│     Backend (FastAPI)                   │
│     http://localhost:8000               │
├─────────────────────────────────────────┤
│  Endpoints:                             │
│  • GET /health                          │
│  • POST /predict                        │
│  • GET /members                         │
│  • GET /member/{id}                     │
│  • GET /stats/risk_distribution         │
│  • POST /bulk_predict                   │
│  • GET /bulk_predict/{job_id}           │
│  • GET /bulk_predict/{job_id}/download  │
│  • POST /report/generate                │
└─────────────────────────────────────────┘
2.2 Data Flow Architecture

User Action
    ↓
React Component (Page)
    ↓
Custom Hook (useMembersData, useBulkPredict, etc.)
    ↓
API Client (app/lib/api.ts)
    ↓
Axios HTTP Request
    ↓
FastAPI Backend
    ↓
MongoDB (Fetch Data)
    ↓
Response (JSON/Blob)
    ↓
Hook Updates State (data, loading, error)
    ↓
Component Re-renders with Real Data
    ↓
User Sees Updated UI

3. API Integration Points
3.1 API Client Configuration

File: app/lib/api.ts

The API client is configured with:

Base URL: Controlled via NEXT_PUBLIC_API_URL environment variable
Default Timeout: 10 seconds
Content Type: JSON
Error Handling: Interceptors for timeout/connection errors

Environment Setup:
NEXT_PUBLIC_API_URL=http://localhost:8000

4. Integrated Pages & Features
4.1 Dashboard Home (/)

Hook: useDashboardData()

Data Flow:
Component Mounts
    ↓
useDashboardData Hook Executes
    ↓
GET /stats/risk_distribution
    ↓
Response: {
  summary: {
    high_risk: number,
    medium_risk: number,
    low_risk: number,
    safe: number,
    total: number
  },
  top_at_risk_members: []
}
    ↓
State Updates (data, loading, error)
    ↓
Component Renders with Real Data

Key Components:

SummaryCard - 4 cards showing member counts by risk level
RiskDistributionChart - Pie chart of risk breakdown
TopAtRiskTable - Table of 10 highest-risk members
API Status Indicator (green dot when connected)

User Actions:

View dashboard metrics
Click member names to go to profile
See last updated timestamp
4.2 Members List (/members)

Hook: useMembersData(skip, limit, risk_level?, country?)

Data Flow:

User Sets Filters/Pagination
    ↓
Hook Parameters Change
    ↓
GET /members?skip={skip}&limit={limit}&risk_level={...}&country={...}
    ↓
Response: {
  total: number,
  page: number,
  limit: number,
  members: [
    {
      member_id: string,
      age: number,
      country: string,
      balance: number,
      risk_bucket: string,
      churn_probability: number
    }
  ]
}
    ↓
Table Re-renders with New Page/Filters

Key Features:

Search: Filter by member ID or name (client-side)
Risk Filter: High Risk, Medium Risk, Low Risk, Safe
Country Filter: France, Germany, Spain
Pagination: Previous/Next buttons + page numbers
Sorting: Click column headers to sort (client-side)

User Actions:

Change filters (resets to page 1)
Navigate between pages
Click "View" to go to member profile
4.3 Member Profile (/members/[id])

Hook: useMemberProfile(memberId)

Data Flow:

URL Parameter: /members/ABC123
    ↓
useMemberProfile("ABC123")
    ↓
GET /member/ABC123
    ↓
Response: {
  member_id: string,
  age: number,
  country: string,
  gender: string,
  credit_score: number,
  balance: number,
  tenure: number,
  products_number: number,
  credit_card: number,
  active_member: number,
  estimated_salary: number,
  churn_probability: number,
  risk_bucket: string,
  days_to_churn: number | null,
  prediction: number,
  top_risk_factors: string[]
}
    ↓
Components Display All Details

Key Components:

MemberInfoCard - Demographics and financial info
RiskGauge - Visual churn probability indicator (0-100%)
FeatureRadarChart - Top 5 risk factors radar chart
RecommendationsCard - Actions based on risk level
Account Information panel
Financial Summary panel

User Actions:

View full member details
See predicted days to churn
View top risk factors
Read recommendations
Back to members list
4.4 Bulk Upload (/upload)

Hook: useBulkPredict()

Data Flow:

User Selects CSV File
    ↓
File Validation (CSV only, <10MB)
    ↓
POST /bulk_predict (FormData with file)
    ↓
Response: {
  job_id: string,
  filename: string,
  status: string,
  total_records: number
}
    ↓
setJobId(response.job_id)
    ↓
Poll GET /bulk_predict/{job_id} Every 2 Seconds
    ↓
Status: "processing" → Show Progress Bar
    ↓
Status: "completed" → Show Results & Download Button
    ↓
GET /bulk_predict/{job_id}/download
    ↓
Receive CSV Blob → Download to User

Key Features:

Drag & drop file upload
File validation (CSV only)
Progress tracking during processing
Results summary (stats cards)
Download predictions as CSV
Polling updates every 2 seconds

CSV Format Required:

credit_score, country, gender, age, tenure, balance,
products_number, credit_card, active_member, estimated_salary
4.5 Report Generator (/reports)

Hook: useReportGenerator()

Data Flow:

User Fills Form:
  - Format: PDF or XLSX
  - Filters: country, age range, risk level
    ↓
POST /report/generate {
  format: "pdf" | "xlsx",
  min_risk_level?: number,
  max_risk_level?: number,
  country?: string,
  min_age?: number,
  max_age?: number
}
    ↓
Backend Filters Predictions from MongoDB
    ↓
Generate PDF/XLSX Report
    ↓
Response: StreamingResponse (Blob)
    ↓
Create Download Link
    ↓
Browser Downloads File

Report Features:

Executive Summary with key metrics
Risk distribution breakdown
Top 10 at-risk members table
Member demographic analysis
Actionable recommendations
Professional formatting (PDF) or data tables (XLSX)

Filter Options:

Country: France, Germany, Spain (or all)
Age Range: Min/Max (optional)
Risk Level: Min/Max percentage (optional)
Format: PDF (professional) or XLSX (data analysis)
5. Custom Hooks Structure
5.1 Hook Patterns

All custom hooks follow this pattern:

typescript
export const useXxxData = (params?: Type) => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.get('/endpoint', { params });
        setData(response.data);
      } catch (err) {
        setError(/* error message */);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return { data, loading, error };
};
5.2 Available Hooks
Hook  Location  Purpose Returns
useDashboardData  app/hooks/useDashboardData.ts Fetch dashboard summary & top members { data, loading, error }
useMembersData  app/hooks/useMembersData.ts Fetch paginated member list with filters  { data, loading, error }
useMemberProfile  app/hooks/useMemberProfile.ts Fetch individual member details { data, loading, error }
useBulkPredict  app/hooks/useBulkPredict.ts Upload CSV, track job, download results { jobId, loading, error, uploadFile, checkStatus, downloadResults }
useReportGenerator  app/hooks/useReportGenerator.ts Generate PDF/XLSX report  { generateReport, loading, error, success }
6. Error Handling Strategy
6.1 Error Handling Layers

Layer 1: API Client (app/lib/api.ts)

Timeout detection (> 10 seconds)
Connection refused handling
Network error detection
Converts errors to user-friendly messages

Layer 2: Custom Hooks

Try/catch around API calls
State management (error, loading)
Console logging for debugging
Pass errors to components

Layer 3: Components

Show loading spinner while fetching
Show error alert with retry button
Show timeout warning after 5 seconds
Graceful degradation

Layer 4: Error Boundary (app/components/ErrorBoundary.tsx)

Catches React component errors
Prevents full page crash
Shows error message with reload button
6.2 Error Display Pattern

Every page follows this pattern:

typescript
// 1. Loading state
if (loading) {
  return <LoadingSpinner />;
}

// 2. Error state
if (error || !data) {
  return <ErrorAlert error={error} onRetry={() => reload()} />;
}

// 3. Success state
return <Content data={data} />;
7. API Endpoints Used
Summary of Connected Endpoints
Method  Endpoint  Page  Purpose
GET /health All Verify backend connection
GET /stats/risk_distribution  Dashboard Get summary stats & top members
GET /members  Members Get paginated member list
GET /member/{id}  Profile Get member details
POST  /bulk_predict Upload  Submit CSV for processing
GET /bulk_predict/{job_id}  Upload  Check job status
GET /bulk_predict/{job_id}/download Upload  Download results CSV
POST  /report/generate  Reports Generate PDF/XLSX report
8. Environment Configuration
8.1 Frontend Environment

File: .env.local

env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production:
# NEXT_PUBLIC_API_URL=https://your-backend.render.com
8.2 Backend Environment

Already configured in Phase 3, but reminder:

env
MONGODB_URL=mongodb+srv://username:password@...
MONGODB_DB_NAME=Credit_Union_Member_Churn
MONGODB_COLLECTION_NAME=Credit_Union_Member_Churn_Prediction_System
MODEL_PATH=../models/churn_model.joblib
ENVIRONMENT=development
DEBUG=True
9. File Structure Summary
9.1 Frontend Structure (Integration-Related)
app/
├── hooks/
│   ├── useDashboardData.ts       # Dashboard data fetching
│   ├── useMembersData.ts         # Members list fetching
│   ├── useMemberProfile.ts       # Member profile fetching
│   ├── useBulkPredict.ts         # Bulk upload logic
│   └── useReportGenerator.ts     # Report generation logic
│
├── lib/
│   ├── api.ts                    # Axios client with interceptors
│   ├── retryUtils.ts             # Retry logic with backoff
│   └── utils.ts                  # Utility functions
│
├── components/
│   ├── ErrorBoundary.tsx         # Global error catcher
│   └── [other components]
│
├── members/
│   ├── page.tsx                  # Members list page
│   └── [id]/page.tsx             # Member profile page
│
├── upload/
│   └── page.tsx                  # Bulk upload page
│
├── reports/
│   └── page.tsx                  # Report generator page
│
└── page.tsx                       # Dashboard home
10. Key Implementation Details
10.1 Real-time Data Polling

Bulk Upload Job Polling:

typescript
// Poll every 2 seconds until job completes
useEffect(() => {
  if (!jobId) return;
  
  const interval = setInterval(async () => {
    const status = await checkStatus(jobId);
    if (status?.status === 'completed' || status?.status === 'failed') {
      clearInterval(interval);
    }
  }, 2000);
  
  return () => clearInterval(interval);
}, [jobId]);
10.2 Pagination Implementation

Members Page:

typescript
const [page, setPage] = useState(0);
const limit = 10;
const skip = page * limit;

const { data } = useMembersData(skip, limit, riskFilter, countryFilter);
const totalPages = Math.ceil(data.total / limit);
10.3 File Download Pattern

Bulk Upload & Reports:

typescript
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', filename);
document.body.appendChild(link);
link.click();
link.parentNode?.removeChild(link);
window.URL.revokeObjectURL(url);
10.4 Timeout Warning

Show after 5 seconds of loading:

typescript
const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

useEffect(() => {
  if (loading && !data) {
    const timeoutId = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }
}, [loading, data]);
11. Testing Checklist
11.1 Dashboard Page
 Page loads with real summary cards
 Risk distribution pie chart displays
 Top 10 at-risk members table shows real data
 API status indicator shows green when connected
 Click member name navigates to profile
 Last updated timestamp shows current time
11.2 Members Page
 Page loads with member list
 Pagination controls work (Previous/Next)
 Page numbers are clickable
 Risk level filter works (all options)
 Country filter works (France/Germany/Spain)
 Search box filters members (client-side)
 "View" button navigates to member profile
 Table shows all required columns
11.3 Member Profile Page
 Page loads with member details
 Member info card displays all data
 Risk gauge shows probability (0-100%)
 Risk gauge color matches risk level
 Feature radar chart displays top 5 factors
 Recommendations card shows risk-appropriate text
 Account information section displays
 Financial summary section displays
 "Back to Members" link works
11.4 Bulk Upload Page
 Drag & drop area visible
 File selection works
 CSV validation rejects non-CSV files
 Upload button is disabled until file selected
 Progress bar shows during processing
 Job status updates while processing
 Download button appears on completion
 Downloaded CSV opens correctly
11.5 Reports Page
 PDF/XLSX format selection works
 Format cards highlight on click
 Country dropdown works
 Age range inputs work
 Risk level range inputs work
 Generate button submits form
 PDF downloads and opens
 XLSX downloads and opens
 Report contains expected data
12. Common Tasks & Solutions
12.1 Fetch Data in a Component
typescript
'use client';

import { useMembersData } from '@/app/hooks/useMembersData';

export default function MyComponent() {
  const { data, loading, error } = useMembersData(0, 10);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data?.members.length} members</div>;
}
12.2 Call Backend Directly (One-time)
typescript
import apiClient from '@/lib/api';

const response = await apiClient.get('/members?skip=0&limit=10');
console.log(response.data);
12.3 Handle API Error with Retry
typescript
import { retryWithBackoff } from '@/lib/retryUtils';

const data = await retryWithBackoff(
  () => apiClient.get('/some-endpoint'),
  { maxAttempts: 3, delayMs: 1000 }
);
12.4 Update Environment Variable
env
# .env.local
NEXT_PUBLIC_API_URL=https://new-backend-url.com

Then restart Next.js dev server.

13. Performance Considerations
13.1 Data Fetching
Dashboard: Fetches once on mount (10 members)
Members: Fetches on pagination/filter change
Member Profile: Fetches once on mount per ID
Bulk Upload: Polls every 2 seconds (auto-stops on completion)
Reports: Fetches on button click (generates file)
13.2 Optimization Tips
Use pagination to limit data per request
Implement caching for frequently accessed data
Consider debouncing search/filter inputs
Use React.memo for heavy components
Profile with browser DevTools
14. Security Notes
14.1 Frontend Security
API URL stored in NEXT_PUBLIC_API_URL (visible to clients - expected)
No sensitive data in local storage
CORS handled by backend
Error messages don't expose sensitive info
14.2 Backend Security (Phase 6)

When deploying to production:

Update NEXT_PUBLIC_API_URL to production backend
Update backend CORS to allow only frontend domain
Add rate limiting on endpoints
Consider API key authentication for sensitive operations
15. Next Steps: Phase 6 Deployment

Once Phase 5 is complete and tested:

Backend Deployment (Render)
Connect GitHub repo to Render
Set environment variables
Deploy to https://your-backend.render.com
Frontend Deployment (Vercel)
Connect GitHub repo to Vercel
Update NEXT_PUBLIC_API_URL to backend URL
Deploy to https://your-frontend.vercel.app
Update Environment
Vercel: Set NEXT_PUBLIC_API_URL=https://your-backend.render.com
Backend: Update CORS origins to include frontend URL
16. Troubleshooting Guide
16.1 Common Issues

Issue: "Cannot connect to server"
Solution: Verify backend is running on http://localhost:8000, check .env.local

Issue: "Request timeout"
Solution: Backend may be slow, check backend logs, increase timeout if needed

Issue: "CSV download fails"
Solution: Verify backend is generating file correctly, check file permissions

Issue: "Report generates but is empty"
Solution: Check MongoDB has data, verify report generation code in backend

Issue: "Pagination doesn't work"
Solution: Check backend /members endpoint returns total and members fields

Summary

Phase 5 successfully integrated the frontend with the backend API across all five main pages. The system now:

✅ Fetches real data from MongoDB via FastAPI
✅ Displays data in real-time dashboards
✅ Handles errors gracefully with user feedback
✅ Provides loading states during API calls
✅ Supports file uploads and downloads
✅ Generates reports in PDF and Excel formats

All components are production-ready for deployment in Phase 6.


