# Internal Recommendation Document
## Data Governance & Security Policies
**Version:** 3.2
**Last Updated:** 2025-01-15
**Maintained By:** Platform Governance Team

---

## Section 1: Data Classification Policy

### 1.1 Data Sensitivity Tiers

All data processed or stored by internal systems must be classified into one of the following tiers:

| Tier | Classification | Examples | Retention |
|------|---------------|----------|-----------|
| T0 | Public | Marketing content, public API docs | No limit |
| T1 | Internal | Internal metrics, team dashboards | 3 years |
| T2 | Confidential | Business logic, internal APIs | 2 years |
| T3 | Restricted | PII, financial data, credentials | 1 year (encrypted) |

### 1.2 Classification Rules

- All new databases and storage buckets must declare a data tier in their schema definition.
- Tier T3 data must never be stored in plaintext under any circumstances.
- Tier T2 and T3 fields must be tagged with `sensitivity_level` metadata in BigQuery schemas.
- Cross-tier data joins are prohibited without explicit data steward approval.

---

## Section 2: Authentication & Authorization

### 2.1 Identity Management

- All services must authenticate via Google Cloud IAM service accounts.
- Service accounts must follow the principle of least privilege (PoLP).
- Human user access to production systems must go through Identity-Aware Proxy (IAP).
- Shared credentials (passwords, API keys in code) are strictly forbidden.

### 2.2 API Security

- All internal APIs must enforce OAuth 2.0 or API key authentication.
- API keys must be stored in Google Secret Manager, never in environment variables or code.
- All API endpoints must implement rate limiting (max 1000 req/min per client by default).
- CORS policies must be explicitly configured; wildcard origins (`*`) are prohibited in production.

### 2.3 Token Management

- JWT tokens must have an expiry no greater than 24 hours.
- Refresh tokens must be stored encrypted in a secure keystore.
- Token rotation must be implemented for all long-lived service integrations.

---

## Section 3: Logging & Observability

### 3.1 Logging Requirements

- All services must emit structured logs in JSON format to Cloud Logging.
- Log levels must be configurable without redeployment (via environment variable or config).
- **CRITICAL:** Logs must never contain raw PII data (names, emails, phone numbers, customer IDs, addresses).
- Sensitive fields in logs must be masked, tokenized, or replaced with anonymized references.

### 3.2 Audit Logging

- All data access events for T2/T3 data must generate an audit log entry.
- Audit logs must include: timestamp, actor identity, resource accessed, action performed.
- Audit logs must be immutable and stored in a separate, access-controlled BigQuery dataset.
- Audit log retention is a minimum of 7 years for compliance.

### 3.3 Metrics & Alerting

- P99 latency thresholds must be defined for all production APIs.
- Anomaly detection alerts must be configured for any T3 data access patterns.
- Error rates exceeding 1% must trigger automated PagerDuty notifications.

---

## Section 4: PII & Data Privacy

### 4.1 PII Definition

The following are classified as Personally Identifiable Information (PII) under this policy:

- Full name, first name, last name
- Email address
- Phone number
- Physical address (street, city, postal code)
- **Customer ID / User ID** (when linkable to an individual)
- Date of birth
- National ID numbers (SSN, Aadhar, PAN, etc.)
- IP address (when associated with user activity)
- Biometric data
- Financial account numbers

### 4.2 PII Handling Rules — CRITICAL

**4.2.1 Storage Prohibition**
- PII must never be stored in plaintext in any system (databases, logs, files, message queues).
- PII in logs is a **Critical Severity** policy violation.
- Storing Customer IDs in plaintext log files is explicitly prohibited under Section 4.2 and Section 3.1.

**4.2.2 Masking & Tokenization**
- All PII in non-production environments must be synthetically generated or fully anonymized.
- Production PII fields must use one of the approved protection mechanisms:
  - **Tokenization:** Replace PII with a non-reversible token (preferred for logs).
  - **Encryption:** AES-256-GCM encryption at rest (required for storage).
  - **Masking:** Partial masking for display purposes (e.g., `cust_****1234`).
  - **DLP Integration:** Use Vertex AI Sensitive Data Protection for automated scanning.

**4.2.3 Data Minimization**
- Only the minimum required PII should be collected and processed.
- PII collection must have an explicit stated purpose and user consent.
- PII must be purged after its retention period expires (automated via lifecycle policies).

### 4.3 Cross-Border Data Transfer

- PII of EU residents is subject to GDPR; data must not leave EU regions without DPA approval.
- PII of Indian residents falls under DPDP Act 2023; data residency in India is required by default.
- Any cross-border transfer requires documented legal basis and security review.

---

## Section 5: Infrastructure & Deployment

### 5.1 Cloud Infrastructure Standards

- All GCP resources must be provisioned via Terraform IaC — no manual console changes in production.
- All compute workloads must run in private VPCs with no direct public internet exposure.
- Cloud Storage buckets must have public access disabled and uniform access control enabled.
- All data in transit must use TLS 1.2 or higher; TLS 1.0/1.1 are deprecated.

### 5.2 Container & Kubernetes Standards

- Container images must be scanned for vulnerabilities before deployment (via Artifact Registry scanning).
- Base images must be from approved vendors only (distroless, official Google, or internally approved).
- Kubernetes pods must not run as root; `runAsNonRoot: true` is mandatory.
- Resource limits (CPU/memory) must be defined for all pods.

### 5.3 Secrets Management

- All secrets (API keys, DB passwords, certificates) must be stored in Google Secret Manager.
- Secrets must be versioned; old versions must be rotated quarterly.
- No secrets in Git repositories — pre-commit hooks must scan for credential leaks.

---

## Section 6: Schema & Database Standards

### 6.1 BigQuery Schema Requirements

- All BigQuery tables must include `created_at` and `updated_at` timestamp columns.
- Tables containing T3 data must have column-level security policies applied.
- Schema changes must be backward-compatible; breaking changes require migration plans.
- All tables must have a defined partition key for tables exceeding 1 GB.

### 6.2 Field Naming Conventions

- Use `snake_case` for all field names.
- PII fields must be suffixed with `_pii` or prefixed with `pii_` for automated scanning.
- Foreign key fields must follow the pattern `{referenced_table}_id`.
- Boolean fields must start with `is_` or `has_`.

### 6.3 Data Lineage

- All data transformation pipelines must document lineage in the central data catalog.
- dbt models must include `meta` tags for data tier classification.

---

## Section 7: AI/ML Governance

### 7.1 Model Usage Policy

- All AI models used in production must be approved by the AI Review Board.
- Models processing T3 data must implement differential privacy or federated learning techniques.
- Model outputs used in automated decision-making (credit, hiring, etc.) must be explainable.

### 7.2 Prompt & Data Handling in AI Systems

- Prompts must not include raw PII; use anonymized identifiers or tokenized references.
- AI-generated outputs containing PII must be reviewed before being stored or transmitted.
- Fine-tuning on production data requires explicit sign-off from Legal and Data Privacy teams.

### 7.3 LLM Integration Standards

- LLM API keys must be stored in Secret Manager (not hardcoded or in `.env` files in repos).
- Rate limits must be implemented for all LLM endpoints to control costs.
- LLM-generated content for customer-facing features requires a human-in-the-loop review stage.

---

## Section 8: Incident Response

### 8.1 Severity Classification

| Severity | Description | Response SLA |
|----------|-------------|--------------|
| P0 | PII breach, production outage | 15 minutes |
| P1 | Data loss risk, security vulnerability | 1 hour |
| P2 | Degraded performance, partial outage | 4 hours |
| P3 | Non-critical bugs, minor issues | 24 hours |

### 8.2 Data Breach Protocol

- Any confirmed or suspected PII exposure must be escalated to the Security team within 15 minutes.
- GDPR requires breach notification to authorities within 72 hours.
- A post-mortem must be completed within 5 business days of any P0/P1 incident.

---

*This document is the authoritative source for all internal governance policies. All technical proposals must demonstrate compliance with these policies before proceeding to implementation.*
