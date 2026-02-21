# Data Dictionary
## AutoAlign Platform — Canonical Field Reference
**Version:** 2.1
**Maintained By:** Data Engineering Team

---

## Overview

This Data Dictionary defines the canonical field names, types, classifications, and handling requirements for all data entities within the platform. All new schema designs must reference this document.

---

## Entity: Customer

| Field Name | Type | Tier | PII | Description | Allowed Storage |
|------------|------|------|-----|-------------|-----------------|
| `customer_id` | STRING(UUID) | T3 | YES | Unique customer identifier — linkable to individual | Tokenized only |
| `customer_token` | STRING | T3 | NO | Non-reversible token for `customer_id` in logs | Any (non-PII) |
| `email_pii` | STRING | T3 | YES | Customer email address | Encrypted at rest |
| `full_name_pii` | STRING | T3 | YES | Customer full name | Encrypted at rest |
| `phone_pii` | STRING | T3 | YES | Customer phone number | Encrypted at rest |
| `dob_pii` | DATE | T3 | YES | Date of birth | Encrypted at rest |
| `address_pii` | JSON | T3 | YES | Physical address | Encrypted at rest |
| `is_active` | BOOLEAN | T1 | NO | Account active status | Any |
| `created_at` | TIMESTAMP | T1 | NO | Record creation timestamp | Any |
| `updated_at` | TIMESTAMP | T1 | NO | Record last update timestamp | Any |
| `consent_marketing` | BOOLEAN | T2 | NO | Marketing consent flag | Any |
| `data_region` | STRING | T2 | NO | Data residency region (e.g., `IN`, `EU`) | Any |

**Notes:**
- `customer_id` must NEVER appear in logs — use `customer_token` instead.
- Direct queries on PII fields require audit log entries.

---

## Entity: Transaction

| Field Name | Type | Tier | PII | Description | Allowed Storage |
|------------|------|------|-----|-------------|-----------------|
| `transaction_id` | STRING(UUID) | T2 | NO | Unique transaction identifier | Any |
| `customer_token` | STRING | T3 | NO | Tokenized customer reference | Any |
| `amount` | NUMERIC(10,2) | T2 | NO | Transaction amount in base currency | Any |
| `currency_code` | STRING(3) | T1 | NO | ISO 4217 currency code | Any |
| `status` | ENUM | T1 | NO | `pending`, `completed`, `failed`, `refunded` | Any |
| `payment_method_token` | STRING | T3 | NO | Tokenized payment method reference | Any |
| `merchant_id` | STRING | T2 | NO | Merchant identifier | Any |
| `created_at` | TIMESTAMP | T1 | NO | Transaction creation timestamp | Any |
| `updated_at` | TIMESTAMP | T1 | NO | Last update timestamp | Any |
| `metadata` | JSON | T2 | NO | Additional non-PII transaction metadata | Any |
| `is_flagged` | BOOLEAN | T2 | NO | Fraud flag indicator | Any |

---

## Entity: UserSession

| Field Name | Type | Tier | PII | Description | Allowed Storage |
|------------|------|------|-----|-------------|-----------------|
| `session_id` | STRING(UUID) | T2 | NO | Unique session identifier | Any |
| `customer_token` | STRING | T3 | NO | Tokenized customer reference (NOT raw customer_id) | Any |
| `ip_token` | STRING | T3 | NO | Tokenized IP address | Any |
| `device_fingerprint` | STRING | T2 | NO | Anonymized device identifier | Any |
| `user_agent` | STRING | T1 | NO | Browser/client user agent string | Any |
| `started_at` | TIMESTAMP | T1 | NO | Session start time | Any |
| `ended_at` | TIMESTAMP | T1 | NO | Session end time (null if active) | Any |
| `is_authenticated` | BOOLEAN | T1 | NO | Authentication status | Any |
| `geo_region` | STRING | T2 | NO | Anonymized geographic region (not precise location) | Any |

---

## Entity: AuditLog

| Field Name | Type | Tier | PII | Description |
|------------|------|------|-----|-------------|
| `log_id` | STRING(UUID) | T2 | NO | Unique log entry ID |
| `timestamp` | TIMESTAMP | T2 | NO | Event timestamp (UTC) |
| `actor_identity` | STRING | T2 | NO | IAM identity of the actor (service account or user) |
| `resource_type` | STRING | T2 | NO | Type of resource accessed |
| `resource_id` | STRING | T2 | NO | Non-PII resource identifier |
| `action` | STRING | T2 | NO | Action performed (READ, WRITE, DELETE, etc.) |
| `outcome` | ENUM | T2 | NO | `SUCCESS`, `FAILURE`, `DENIED` |
| `ip_token` | STRING | T3 | NO | Tokenized IP of the request |
| `request_id` | STRING | T2 | NO | Correlation ID for the triggering request |

---

## Entity: ServiceConfig

| Field Name | Type | Tier | PII | Description |
|------------|------|------|-----|-------------|
| `config_key` | STRING | T2 | NO | Configuration key name |
| `config_value` | STRING | T2 | NO | Configuration value (no secrets) |
| `service_name` | STRING | T2 | NO | Owning service name |
| `environment` | ENUM | T2 | NO | `dev`, `staging`, `prod` |
| `is_encrypted` | BOOLEAN | T2 | NO | Whether value is encrypted |
| `secret_ref` | STRING | T2 | NO | Secret Manager reference path (if applicable) |
| `updated_at` | TIMESTAMP | T1 | NO | Last update timestamp |
| `updated_by` | STRING | T2 | NO | IAM identity of last updater |

---

## Prohibited Fields & Anti-Patterns

The following field patterns are explicitly **prohibited** in production schemas:

| Anti-Pattern | Reason | Correct Alternative |
|--------------|--------|---------------------|
| `customer_id` in log tables | PII leakage | Use `customer_token` |
| `password` or `password_hash` in general tables | Security | Use Auth provider (Firebase Auth / Cloud Identity) |
| `raw_ip_address` in analytics | PII risk | Use `ip_token` or `geo_region` |
| `email` without `_pii` suffix | Bypasses automated scanning | Use `email_pii` |
| `api_key` or `secret_key` in any table | Credential exposure | Store in Secret Manager |
| `ssn`, `pan`, `aadhar` in plaintext | Legal violation | Must be encrypted or tokenized |
| Nullable `created_at` | Data lineage gaps | Always `NOT NULL` with `DEFAULT CURRENT_TIMESTAMP` |

---

## Approved Data Types

| Use Case | Approved Type | Notes |
|----------|--------------|-------|
| Unique IDs | `STRING(UUID v4)` | Use UUID v4 for privacy (unpredictable) |
| Currency amounts | `NUMERIC(10,2)` | Never use FLOAT for money |
| Timestamps | `TIMESTAMP` (UTC) | Always store in UTC |
| Status/enums | `STRING` with validation | Document allowed values |
| JSON metadata | `JSON` (BigQuery) | Must not contain PII |
| Boolean flags | `BOOLEAN` | Use `is_` or `has_` prefix |
| File references | `STRING` (GCS URI) | Full `gs://bucket/path` format |

---

## BigQuery Partitioning Guidelines

| Table Size | Partition Type | Partition Field |
|------------|---------------|-----------------|
| < 1 GB | No partition required | — |
| 1 GB – 100 GB | Date partition | `created_at` |
| > 100 GB | Date + Cluster | `created_at` + high-cardinality filter field |
| Event streams | Ingestion time partition | `_PARTITIONTIME` |

---

*All schema proposals must reference this dictionary. Deviations require written approval from the Data Engineering team.*
