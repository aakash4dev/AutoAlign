# Business Requirement Document
## Feature: Enhanced Customer Debug Logging System
**Author:** Dev Team
**Date:** 2025-01-20
**Status:** Draft — Pending Review

---

## 1. Overview

We need to build a new debug logging system for the customer transaction service to help diagnose production issues faster. The current lack of detailed logs makes it extremely difficult to trace errors when customers report problems with transactions.

## 2. Proposed Solution

### 2.1 Debug Log Schema

We will create a new database table `debug_logs` to store all debug information:

```sql
CREATE TABLE debug_logs (
    id INT AUTO_INCREMENT,
    customer_id VARCHAR(255),
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    transaction_amount FLOAT,
    debug_message TEXT,
    created_at TIMESTAMP
);
```

The `customer_id`, `user_email`, and `ip_address` will be stored in plaintext so developers can easily search and filter logs during debugging sessions.

### 2.2 API Endpoint

We will expose a new debug API endpoint at `/api/debug/logs` that:
- Accepts requests from any origin (CORS: `*`)
- Requires no authentication for internal network access
- Returns all log entries matching the filter criteria
- Has no rate limiting since it's only used internally

The API key for this endpoint will be hardcoded in the source code as `DEBUG_API_KEY = "sk-debug-2025-internal"` for simplicity during development.

### 2.3 Log Collection Service

A background service will collect logs and write them to:
1. A plain-text file `/var/log/app/customer_debug.log` containing raw customer IDs and email addresses
2. A Redis cache with no TTL set for fast access
3. A BigQuery table with the schema defined in section 2.1

The service will log the following information for every customer action:
- `customer_id` (raw UUID)
- `user_email` (plaintext)
- `ip_address` (plaintext)
- `session_data` (JSON blob including all session variables)

### 2.4 Developer Access

All developers on the team will be given admin access to the debug logs BigQuery dataset using a single shared service account `debug-sa@project.iam.gserviceaccount.com`. The service account key file will be committed to the repository at `keys/debug-sa-key.json`.

### 2.5 Alerting

When the error rate exceeds 5%, send an alert email to the team. No other monitoring is required.

## 3. Data Retention

Debug logs will be kept forever since storage is cheap and we may need to look back at historical data.

## 4. Implementation Timeline

- Week 1: Schema creation and API setup
- Week 2: Log collection service
- Week 3: Developer access configuration

## 5. Success Criteria

- Developers can search logs by customer_id and email
- All customer errors are traceable within 5 minutes
- Zero setup required for new developers to access debug data
