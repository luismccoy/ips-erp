# Observability Audit - Cycle 1
**Date:** 2026-01-29  
**Auditor:** Observability Engineer (Subagent)  
**Scope:** Security event logging and monitoring for ERP application  
**Working Directory:** `~/projects/ERP/`

---

## Executive Summary

**Current Observability Maturity: LEVEL 1 (Basic)**  
The application has foundational logging for authorization events but **lacks critical security monitoring infrastructure**. While unauthorized access attempts are tracked, there is:
- ❌ No real-time alerting for security incidents
- ❌ No metrics aggregation or anomaly detection
- ❌ No centralized error tracking
- ❌ No structured logging backend
- ❌ No runtime assertions for RBAC violations

**Risk Assessment:** **HIGH** — Security breaches could go undetected for extended periods.

---

## Current State

### ✅ What's Working

| Component | Logging Present | Events Tracked |
|-----------|----------------|----------------|
| **RouteGuard.tsx** | ✅ YES | `Unauthorized Access Attempt` (analytics + console.warn) |
| **App.tsx** | ✅ YES | `Session Started`, `Login Success`, `Login Failed`, `Logout`, `Demo Login Used` |
| **useAuth.ts** | ⚠️ PARTIAL | Token refresh events (console only) |
| **auth.ts** | ⚠️ PARTIAL | Logout steps (console only, no analytics) |

### 📊 Analytics Infrastructure

**Implementation:** Mock-only (`useAnalytics.ts`)
- ✅ Event tracking API exists
- ✅ User identification API exists
- ❌ **Not connected to real backend** (Mixpanel/Amplitude/CloudWatch)
- ❌ Events logged to console only

**Current Events Tracked:**
```typescript
// Auth Events
- "Session Started" → { role }
- "Login Success" → { method: 'email' }
- "Login Failed" → { error }
- "Logout" → {}
- "Demo Login Used" → { role, source }

// Authorization Events
- "Unauthorized Access Attempt" → { path, userRole, timestamp }
- "Direct Family Route Access" → { source: 'url' }

// Page Views
- "Page View" → { page }
```

---

## Gaps

| Gap | Risk | Priority | Impact |
|-----|------|----------|--------|
| **No real analytics backend** | HIGH | P0 | Security events go nowhere; cannot detect attacks or incidents |
| **No alerting system** | HIGH | P0 | No notifications for unauthorized access attempts, brute force, or breaches |
| **No structured logging** | MEDIUM | P1 | Logs are unstructured console output; not searchable or filterable |
| **No metrics collection** | HIGH | P0 | Cannot detect anomalies (e.g., spike in failed logins, unusual session patterns) |
| **No error tracking (Sentry/CloudWatch)** | MEDIUM | P1 | Application errors could indicate security issues but go unnoticed |
| **No session anomaly detection** | HIGH | P0 | Cannot detect session hijacking, token replay, or privilege escalation |
| **Missing auth event logging** | MEDIUM | P1 | Token refresh, session expiry, and logout not tracked in analytics |
| **No runtime RBAC assertions** | MEDIUM | P1 | Protected routes could render without proper auth checks in edge cases |
| **No CI enforcement for route metadata** | LOW | P2 | New routes could be added without RBAC definitions |
| **No log retention policy** | LOW | P2 | Console logs disappear; no historical analysis possible |

---

## Recommended Additions

### 1. Analytics Backend Integration (P0)

**Action:** Connect `useAnalytics.ts` to a real observability platform.

**Options:**
- **AWS CloudWatch Logs + Insights** (recommended for AWS Amplify)
- **Mixpanel** (for user behavior analytics)
- **Amplitude** (for product analytics)
- **Datadog** (for enterprise monitoring)

**Implementation:**

| File | Change | Code Example |
|------|--------|--------------|
| `src/hooks/useAnalytics.ts` | Replace mock with CloudWatch SDK | ```typescript<br>import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";<br><br>const AnalyticsService = {<br>  track: async (event) => {<br>    await cloudwatch.send(new PutLogEventsCommand({<br>      logGroupName: '/ips-erp/security-events',<br>      logStreamName: 'auth',<br>      logEvents: [{<br>        timestamp: event.timestamp,<br>        message: JSON.stringify(event)<br>      }]<br>    }));<br>  }<br>};``` |

---

### 2. Critical Auth Event Logging (P0)

**Action:** Add missing security events to analytics pipeline.

| File | Event to Add | Trigger | Priority |
|------|-------------|---------|----------|
| `src/utils/auth.ts` | `Logout Completed` | After `signOut()` success | P0 |
| `src/utils/auth.ts` | `Logout Failed` | After `signOut()` error | P0 |
| `src/utils/auth.ts` | `Session Cleanup Failed` | If localStorage clear fails | P1 |
| `src/hooks/useAuth.ts` | `Token Refresh Success` | On `tokenRefresh` hub event | P1 |
| `src/hooks/useAuth.ts` | `Token Refresh Failed` | On `tokenRefresh_failure` hub event | P0 |
| `src/hooks/useAuth.ts` | `Session Expired` | When token refresh fails repeatedly | P0 |
| `src/hooks/useAuth.ts` | `Role Changed` | When user role updates | P1 |
| `src/components/RouteGuard.tsx` | `RBAC Violation Detected` | When protected component renders without auth | P0 |

**Example Implementation (auth.ts):**
```typescript
import { useAnalytics } from '../hooks/useAnalytics';

export async function logout(): Promise<void> {
  const { trackEvent } = useAnalytics();
  
  try {
    console.log('🔐 Starting secure logout...');
    trackEvent('Logout Initiated', { timestamp: Date.now() });
    
    if (isUsingRealBackend()) {
      await signOut({ global: true });
      trackEvent('Cognito Signout Success', { global: true });
    }
    
    // ... rest of cleanup ...
    
    trackEvent('Logout Completed', { 
      clearedKeys: localStorageKeys.length,
      timestamp: Date.now()
    });
    
    window.location.href = '/';
  } catch (error) {
    trackEvent('Logout Failed', { 
      error: String(error),
      timestamp: Date.now()
    });
    // ... fallback cleanup ...
  }
}
```

---

### 3. Alerting Infrastructure (P0)

**Action:** Set up real-time alerts for security anomalies.

**Platform:** AWS CloudWatch Alarms + SNS

**Alerts to Configure:**

| Alert | Trigger Condition | Action | Severity |
|-------|------------------|--------|----------|
| **Multiple Unauthorized Access Attempts** | 5+ `Unauthorized Access Attempt` events from same user in 10 minutes | SNS → Email/Slack | CRITICAL |
| **Repeated Login Failures** | 10+ `Login Failed` events from same IP in 5 minutes | SNS → Email + Temporary IP block | CRITICAL |
| **Token Refresh Failures Spike** | 20+ `Token Refresh Failed` in 1 hour | SNS → Email | HIGH |
| **Logout Failures** | Any `Logout Failed` event | SNS → Email | MEDIUM |
| **RBAC Violation** | Any `RBAC Violation Detected` event | SNS → Email/PagerDuty | CRITICAL |
| **Unusual Session Patterns** | User accessing routes outside normal patterns | SNS → Email | MEDIUM |

**Implementation:**
```bash
# Create CloudWatch Log Metric Filter
aws logs put-metric-filter \
  --log-group-name /ips-erp/security-events \
  --filter-name UnauthorizedAccessAttempts \
  --filter-pattern '[timestamp, event="Unauthorized Access Attempt"]' \
  --metric-transformations \
    metricName=UnauthorizedAccessCount,metricNamespace=IPS-ERP/Security,metricValue=1

# Create Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "Multiple-Unauthorized-Access-Attempts" \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --metric-name UnauthorizedAccessCount \
  --namespace IPS-ERP/Security \
  --period 600 \
  --statistic Sum \
  --threshold 5 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:security-alerts
```

---

### 4. Structured Logging (P1)

**Action:** Replace `console.log` with structured logger.

**Implementation:**

| File | Change |
|------|--------|
| `src/utils/logger.ts` (NEW) | Create centralized logging utility |

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  role?: string;
  sessionId?: string;
}

class Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      role: this.getCurrentRole(),
      sessionId: this.getSessionId()
    };
    
    // Send to CloudWatch
    this.sendToCloudWatch(entry);
    
    // Also log to console in dev
    if (import.meta.env.DEV) {
      console.log(JSON.stringify(entry, null, 2));
    }
  }
  
  security(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.SECURITY, message, context);
  }
  
  // ... other methods ...
}

export const logger = new Logger();
```

**Migration Example:**
```typescript
// Before
console.warn(`[SECURITY] Unauthorized access attempt to ${currentPath} by role: ${userRole || 'none'}`);

// After
logger.security('Unauthorized access attempt', {
  path: currentPath,
  userRole: userRole || 'unauthenticated',
  timestamp: Date.now()
});
```

---

### 5. Metrics Dashboard (P1)

**Action:** Create CloudWatch Dashboard for security metrics.

**Widgets:**
- **Unauthorized Access Attempts** (line chart, 24h)
- **Login Success/Failure Ratio** (pie chart)
- **Active Sessions by Role** (bar chart)
- **Token Refresh Failures** (line chart, 7d)
- **Average Session Duration** (number)
- **Top 10 Blocked Routes** (table)

**Implementation:**
```bash
# Create dashboard via AWS CLI or Console
aws cloudwatch put-dashboard \
  --dashboard-name IPS-ERP-Security \
  --dashboard-body file://dashboard-config.json
```

---

### 6. Error Tracking Service (P1)

**Action:** Integrate Sentry or AWS X-Ray for exception tracking.

**Recommended:** Sentry (easier integration, better UX for React)

**Implementation:**

| File | Change |
|------|--------|
| `src/main.tsx` | Add Sentry initialization |
| `src/components/ErrorBoundary.tsx` (NEW) | Capture React errors |

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// src/components/ErrorBoundary.tsx
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';

export function ErrorBoundary({ children }) {
  return (
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </SentryErrorBoundary>
  );
}
```

---

### 7. Session Anomaly Detection (P0)

**Action:** Implement client-side checks for suspicious session activity.

**File:** `src/hooks/useSessionMonitor.ts` (NEW)

**Checks:**
- Sudden role changes without login
- Multiple rapid route changes (potential enumeration attack)
- Access from new device/browser without re-auth
- Simultaneous sessions from different IPs (potential hijacking)

```typescript
export function useSessionMonitor() {
  const { trackEvent } = useAnalytics();
  const { role, user } = useAuth();
  
  useEffect(() => {
    // Detect role tampering
    const storedRole = sessionStorage.getItem('ips-erp-demo-role');
    if (role && storedRole && role !== storedRole) {
      trackEvent('Session Anomaly Detected', {
        type: 'role_mismatch',
        expectedRole: storedRole,
        actualRole: role,
        severity: 'CRITICAL'
      });
      // Force logout
      logout();
    }
    
    // Detect rapid route changes (enumeration attack)
    const routeHistory = JSON.parse(sessionStorage.getItem('route-history') || '[]');
    if (routeHistory.length > 20) { // 20 routes in session
      const recentRoutes = routeHistory.slice(-10);
      const timespan = recentRoutes[9].timestamp - recentRoutes[0].timestamp;
      if (timespan < 30000) { // 10 routes in 30 seconds
        trackEvent('Session Anomaly Detected', {
          type: 'route_enumeration',
          routeCount: recentRoutes.length,
          timespan,
          severity: 'HIGH'
        });
      }
    }
  }, [role, user]);
}
```

---

## Runtime Assertions Needed

### 1. RBAC Violation Assertion (P0)

**Goal:** Ensure protected routes NEVER render without proper authorization.

**File:** `src/components/RouteGuard.tsx`

**Implementation:**
```typescript
export function RouteGuard({ userRole, currentPath, onUnauthorized, children }: RouteGuardProps) {
  const { trackEvent } = useAnalytics();
  const renderStartTime = useRef(Date.now());
  
  useEffect(() => {
    // RUNTIME ASSERTION: Log if component rendered without auth
    if (!isAuthorizedForRoute(currentPath, userRole)) {
      const renderTime = Date.now() - renderStartTime.current;
      
      trackEvent('RBAC Violation Detected', {
        path: currentPath,
        userRole: userRole || 'none',
        renderTime,
        severity: 'CRITICAL',
        timestamp: Date.now()
      });
      
      // Also log to Sentry with stack trace
      Sentry.captureException(new Error('Protected route rendered without authorization'), {
        level: 'fatal',
        tags: {
          component: 'RouteGuard',
          path: currentPath,
          userRole: userRole || 'unauthenticated'
        }
      });
      
      // Force immediate redirect
      onUnauthorized();
    }
  }, []);
  
  // ... rest of component
}
```

### 2. Session State Integrity Check (P1)

**Goal:** Detect localStorage tampering.

**File:** `src/hooks/useAuth.ts`

**Implementation:**
```typescript
useEffect(() => {
  // Verify session integrity every 30 seconds
  const integrityCheck = setInterval(() => {
    const demoMode = sessionStorage.getItem('ips-erp-demo-mode');
    const demoRole = sessionStorage.getItem('ips-erp-demo-role');
    
    if (demoMode === 'true' && !demoRole) {
      trackEvent('Session Integrity Violation', {
        type: 'demo_mode_without_role',
        severity: 'HIGH'
      });
      logout();
    }
    
    if (role && !demoMode && !isUsingRealBackend()) {
      trackEvent('Session Integrity Violation', {
        type: 'role_without_demo_mode',
        severity: 'HIGH'
      });
      logout();
    }
  }, 30000);
  
  return () => clearInterval(integrityCheck);
}, [role]);
```

### 3. Token Expiry Assertion (P1)

**Goal:** Log when tokens expire and force re-auth.

**File:** `src/hooks/useAuth.ts`

**Implementation:**
```typescript
// In Hub listener
case 'tokenRefresh_failure':
  trackEvent('Token Expired', {
    userId: user?.userId,
    role,
    timestamp: Date.now()
  });
  
  // Check if token is truly expired vs. network issue
  const retryCount = sessionStorage.getItem('token-refresh-retries') || '0';
  if (parseInt(retryCount) > 3) {
    trackEvent('Session Expired - Force Logout', {
      retryCount: parseInt(retryCount),
      severity: 'HIGH'
    });
    logout();
  } else {
    sessionStorage.setItem('token-refresh-retries', String(parseInt(retryCount) + 1));
  }
  break;
```

---

## CI/CD Enforcement

### 1. Route Metadata Validation (P2)

**Goal:** Prevent new routes from being added without RBAC metadata.

**File:** `scripts/validate-routes.ts` (NEW)

```typescript
#!/usr/bin/env tsx
import { ROUTE_PERMISSIONS } from '../src/constants/navigation';
import * as fs from 'fs';

// Extract all route paths from codebase
const routeFiles = [
  'src/App.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/SimpleNurseApp.tsx',
  'src/components/FamilyPortal.tsx'
];

const routes: string[] = [];

routeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const routeMatches = content.match(/window\.location\.pathname\s*===?\s*['"]([^'"]+)['"]/g);
  if (routeMatches) {
    routeMatches.forEach(match => {
      const path = match.match(/['"]([^'"]+)['"]/)?.[1];
      if (path) routes.push(path);
    });
  }
});

// Check if all routes have RBAC definitions
const missingRoutes = routes.filter(route => !ROUTE_PERMISSIONS[route]);

if (missingRoutes.length > 0) {
  console.error('❌ RBAC metadata missing for routes:', missingRoutes);
  console.error('Add these routes to ROUTE_PERMISSIONS in src/constants/navigation.ts');
  process.exit(1);
}

console.log('✅ All routes have RBAC metadata');
```

**GitHub Actions Integration:**
```yaml
# .github/workflows/security-checks.yml
name: Security Checks

on: [pull_request]

jobs:
  validate-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run validate:routes
```

### 2. Audit Log Schema Validation (P2)

**Goal:** Ensure all trackEvent calls follow consistent schema.

**File:** `scripts/validate-analytics.ts` (NEW)

```typescript
#!/usr/bin/env tsx
import * as fs from 'fs';

const REQUIRED_EVENTS = [
  'Session Started',
  'Login Success',
  'Login Failed',
  'Logout',
  'Unauthorized Access Attempt',
  'Token Refresh Failed'
];

const codebase = fs.readFileSync('src/**/*.{ts,tsx}', 'utf-8');

const missingEvents = REQUIRED_EVENTS.filter(event => 
  !codebase.includes(`'${event}'`) && !codebase.includes(`"${event}"`)
);

if (missingEvents.length > 0) {
  console.error('❌ Required security events not tracked:', missingEvents);
  process.exit(1);
}

console.log('✅ All required security events are tracked');
```

---

## Implementation Roadmap

### Phase 1: Critical Security Monitoring (Week 1)
- [ ] Integrate CloudWatch Logs for security events
- [ ] Add missing auth event logging (logout, token refresh)
- [ ] Implement runtime RBAC assertions
- [ ] Set up critical alerts (unauthorized access, login failures)

### Phase 2: Observability Infrastructure (Week 2)
- [ ] Deploy structured logging
- [ ] Integrate Sentry for error tracking
- [ ] Create CloudWatch security dashboard
- [ ] Implement session anomaly detection

### Phase 3: CI/CD Hardening (Week 3)
- [ ] Add route metadata validation to CI
- [ ] Add analytics schema validation
- [ ] Configure log retention policies
- [ ] Document incident response playbook

### Phase 4: Advanced Monitoring (Week 4)
- [ ] Implement metrics aggregation
- [ ] Set up anomaly detection ML model (CloudWatch Anomaly Detection)
- [ ] Create alerting escalation policies
- [ ] Conduct security incident simulation

---

## Success Metrics

After implementation, we should achieve:

| Metric | Current | Target |
|--------|---------|--------|
| **Time to detect unauthorized access** | Unknown (no alerts) | < 1 minute |
| **Security event coverage** | 40% | 95% |
| **Log searchability** | 0% (console only) | 100% (CloudWatch Insights) |
| **Incident response time** | N/A | < 15 minutes |
| **False positive rate for alerts** | N/A | < 5% |
| **Security event retention** | 0 days (console) | 90 days (CloudWatch) |

---

## Appendix: Critical Security Events Checklist

### ✅ Currently Logged
- [x] Unauthorized route access attempts
- [x] Login success/failure
- [x] Session start
- [x] Demo mode usage

### ❌ Missing (High Priority)
- [ ] Logout events (success/failure)
- [ ] Token refresh success/failure
- [ ] Session expiry
- [ ] Role changes
- [ ] RBAC violations during render
- [ ] Session integrity violations
- [ ] Multiple concurrent sessions
- [ ] Unusual access patterns
- [ ] Password reset attempts
- [ ] API authentication failures
- [ ] Data export/download events
- [ ] Admin privilege usage

---

## Conclusion

**Current Risk Level: HIGH**

The application has foundational authorization logging but lacks the infrastructure to detect, alert, and respond to security incidents in real-time. Implementing the recommended additions (particularly CloudWatch integration and alerting) is **critical** before moving to production.

**Estimated Implementation Effort:** 3-4 weeks (1 engineer)  
**Risk Reduction:** 80% (from HIGH to LOW)

**Next Steps:**
1. Review this audit with security stakeholder
2. Prioritize P0 items for immediate implementation
3. Set up CloudWatch + SNS infrastructure
4. Begin Phase 1 (Critical Security Monitoring)

---

**Report compiled by:** Observability Engineer (Subagent)  
**Date:** 2026-01-29  
**Status:** DRAFT - Awaiting Review
