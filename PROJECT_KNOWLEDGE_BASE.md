# ILPEP — Indian Loyalty Points Exchange Platform
# Complete Project Knowledge Base

> **Purpose**: This file contains ALL extracted knowledge from the SRS, SDD, and Execution Plan documents.
> It serves as the single source of truth so you never need to re-provide those documents.

---

# PART 1: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Source**: SRS_ Indian Loyalty Points Exchange Platform (ILPEP).pdf (33 pages)
**Team**: Aditya Kumar Yadav, Pranjal Gupta, Jashwanth B, Yash Ahlawat, Bhakti
**Supervisor**: Dr. Rekha R, University of Delhi

## 1.1 Project Objective
To aggregate and liquidate fragmented loyalty points into a unified digital store of value, acting as a Prepaid Payment Instrument (PPI) issuer authorized by the RBI. An estimated ₹15,000 Crore worth of loyalty assets remain unredeemed annually due to platform siloing.

## 1.2 User Classification

| User Type | Verification | Transaction Constraints | Capabilities |
|-----------|-------------|------------------------|--------------|
| **Small PPI** | Mobile OTP | Monthly load ≤ ₹10,000; Yearly ≤ ₹1,20,000 | Basic aggregation, restricted exchange, no cash withdrawal |
| **Full-KYC** | PAN (NSDL) + Aadhaar XML + Video-CIP | Wallet balance ≤ ₹2,00,000 | High-frequency exchanges, enhanced pricing, full liquidity |

## 1.3 Functional Requirements

### User Management
- Registration with mobile number
- Tiered KYC: Small-KYC (OTP), Full-KYC (PAN + Aadhaar + Video-CIP)
- Profile management

### Partner Integration
- Connectors for loyalty programs: Travel, E-commerce, Credit Cards (HDFC, SBI, etc.)
- Adapter Pattern for heterogeneous APIs
- ETL (Extract, Transform, Load) to normalize point types into standard internal valuation

### Exchange Engine
- Real-time valuation and conversion of points to ILPEP "Coins"
- DQN (Deep Q-Network) based dynamic pricing
- Time-bound quotes with cooldown to prevent arbitrage

### Wallet Services
- Balance inquiry
- Transaction history
- Redemption via UPI / Merchant payments

### Fraud Detection (PFDV - Predictive Fraud Detection & Validation)
- XGBoost classifier for real-time fraud scoring (0.0 to 1.0)
- KL-Divergence for behavioral drift monitoring
- Gini Impurity for decision tree classification
- Device farming detection
- Smurfing detection (multiple small transactions)
- Integrity Validation Engine for cryptographic signature checks

### Regulatory Compliance
- RBI PPI Master Directions compliance
- GST @18% on service fees (SAC 9971)
  - Intra-state: CGST (9%) + SGST (9%)
  - Inter-state: IGST (18%)
- PMLA compliance
- Automated STR (Suspicious Transaction Reports) to FIU-IND
- FINnet XML schema for regulatory reporting

### Security
- 2FA (Two-factor authentication)
- JWT RS256 session management
- AES-256 encryption (data at rest)
- TLS 1.3 (data in transit)
- RBAC (Role-Based Access Control)
- Tokenization of sensitive data

## 1.4 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Fraud scoring latency | < 200ms |
| End-to-end transaction | < 2 seconds |
| Throughput | 5,000 TPS |
| Availability | 99.9% uptime |
| Scalability | Horizontal via microservices |
| Encryption (rest) | AES-256 |
| Encryption (transit) | TLS 1.3 |

## 1.5 Tech Stack (from SRS appendix)
- Next.js 14, TypeScript, PostgreSQL (Core), Redis (Cache), Kafka (Event Streaming)

## 1.6 API Examples (from Appendix A)
- NSDL PAN Check: `/api/v1/kyc/pan/verify`
- Sample payloads for all major endpoints

## 1.7 Appendix Notes
- Appendix B: High-level architecture and sequence diagrams for point redemption
- Appendix C: TBD items — final phase-1 partner list, exact fraud score thresholds

---

# PART 2: SOFTWARE DESIGN DOCUMENT (SDD)

**Source**: SDD_SE_PointLedger (Google Docs)

## 2.1 System Architecture

### Target: 5,000 TPS with horizontal scalability
### Architecture: Microservices framework, event-driven, loosely coupled

### Three-Layer Architecture:

**1. Access & Gateway Layer**
- Omnichannel entry: Android/iOS apps + Web portal
- API Gateway: rate limiting, JWT validation, request routing
- TLS 1.3 encrypted channels

**2. Core Microservices**
- **Loyalty Aggregation Service**: Adapter Pattern for bank APIs, ETL normalization
- **Pricing & Recommendation Engine**: DQN for dynamic pricing, collaborative filtering
- **Fraud Detection Engine**: XGBoost classifier, <200ms latency, Redis feature store
- **Ledger & Accounting Service**: Double-entry bookkeeping, source of truth

**3. Integration Layer (Regulatory Northbound)**
- NSDL (PAN verification), UIDAI (Aadhaar/Video-CIP)
- GSTN (e-invoicing), FIU-IND (STR reporting)

## 2.2 Data Flow Model — Exchange Request Lifecycle

```
1. Request & Validation (T+0ms)
   → PPI limit check (Small: ₹10K/month, Full: ₹2L balance)

2. Intelligence Phase (T+200ms)
   → Fraud scan (Redis + XGBoost): detect smurfing, device farming
   → DQN price quote with cooldown

3. Atomic Execution (T+500ms–2s)
   → Double-entry ledger transaction in PostgreSQL
   → Debit: User Points Liability
   → Credit: Revenue, Partner Receivables, GST Payable
   → Full rollback on any failure (ACID)

4. Taxation & Compliance (Post-Process)
   → 18% GST applied (CGST/SGST or IGST based on state_code)
   → STR auto-flagged if: txn > ₹50K in Small PPI, or high fraud score
```

## 2.3 Design Patterns

| Pattern | Where Used |
|---------|-----------|
| **Strategy Pattern** | KYC module — `KYCValidator` interface with `SmallKYCValidator` / `FullKYCValidator` |
| **Adapter Pattern** | External APIs — `HDFC_BankAdapter` converts bank XML to standard `PointObject` |
| **Double-entry Accounting** | `JournalEntry` ↔ `LedgerLine` — every debit has equal opposite credit |

## 2.4 Database Schema (PostgreSQL 15, AWS Mumbai ap-south-1)

### Design Principles
- Third Normal Form (3NF)
- ACID-compliant financial transactions
- Double-entry accounting enforcement
- Referential integrity (foreign keys)
- RBI data localization compliance
- Immutable audit logging
- Regulatory traceability

### All 11 Tables:

#### 1. users
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100),
    pan_hash VARCHAR(64),              -- SHA-256 hash, never raw PAN
    aadhaar_reference VARCHAR(20),     -- masked/reference only
    kyc_status VARCHAR(10) NOT NULL CHECK (kyc_status IN ('SMALL','FULL')),
    state_code VARCHAR(2) NOT NULL,
    kyc_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

#### 2. wallets
```sql
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance_inr DECIMAL(18,2) DEFAULT 0.00 CHECK (balance_inr >= 0),
    monthly_load_inr DECIMAL(18,2) DEFAULT 0.00,
    yearly_load_inr DECIMAL(18,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Business rule via trigger: SMALL → monthly_load ≤ 10000, FULL → balance ≤ 200000
```

#### 3. partner_merchants
```sql
CREATE TABLE partner_merchants (
    partner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT NOT NULL,
    auth_type VARCHAR(50),
    settlement_account VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. loyalty_accounts
```sql
CREATE TABLE loyalty_accounts (
    loyalty_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partner_merchants(partner_id),
    external_account_id VARCHAR(100) NOT NULL,
    points_balance DECIMAL(18,2) DEFAULT 0.00,
    last_synced_at TIMESTAMPTZ,
    UNIQUE(user_id, partner_id)
);
```

#### 5. exchange_transactions
```sql
CREATE TABLE exchange_transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    source_partner_id UUID REFERENCES partner_merchants(partner_id),
    source_points DECIMAL(18,2) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    gross_value_inr DECIMAL(18,2) NOT NULL,
    service_fee DECIMAL(18,2) NOT NULL,
    gst_amount DECIMAL(18,2) NOT NULL,
    net_value_inr DECIMAL(18,2) NOT NULL,
    fraud_score DECIMAL(5,4),
    txn_status VARCHAR(20) CHECK (txn_status IN ('PENDING','SUCCESS','BLOCKED','FLAGGED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_user ON exchange_transactions(user_id);
CREATE INDEX idx_txn_created ON exchange_transactions(created_at);
CREATE INDEX idx_txn_fraud ON exchange_transactions(fraud_score);
```

#### 6. journal_entries (Double-Entry Header)
```sql
CREATE TABLE journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID UNIQUE REFERENCES exchange_transactions(txn_id) ON DELETE CASCADE,
    entry_type VARCHAR(50),
    total_debit DECIMAL(18,2) NOT NULL,
    total_credit DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (total_debit = total_credit)  -- CRITICAL: enforces balance
);
```

#### 7. ledger_lines (Line Items)
```sql
CREATE TABLE ledger_lines (
    line_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES journal_entries(entry_id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    debit DECIMAL(18,2) DEFAULT 0.00,
    credit DECIMAL(18,2) DEFAULT 0.00,
    CHECK (
        (debit > 0 AND credit = 0) OR
        (credit > 0 AND debit = 0)
    )
);
```

#### 8. gst_records
```sql
CREATE TABLE gst_records (
    gst_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID REFERENCES exchange_transactions(txn_id) ON DELETE CASCADE,
    gst_type VARCHAR(10) CHECK (gst_type IN ('CGST','SGST','IGST')),
    gst_rate DECIMAL(5,2) NOT NULL,
    gst_amount DECIMAL(18,2) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. fraud_logs
```sql
CREATE TABLE fraud_logs (
    fraud_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID REFERENCES exchange_transactions(txn_id),
    model_version VARCHAR(20),
    fraud_score DECIMAL(5,4),
    decision VARCHAR(20),
    flagged_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. str_reports
```sql
CREATE TABLE str_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    total_amount DECIMAL(18,2),
    trigger_reason TEXT,
    xml_payload TEXT,
    submitted_to_fiu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 11. audit_logs
```sql
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50),
    entity_id UUID,
    action_type VARCHAR(50),
    performed_by UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);
-- IMMUTABLE: No UPDATE, No DELETE, Append-only
```

### Redis Feature Store (ML)
```
Key format: risk_profile:{user_id}
Example:
{
  "velocity_1h": 15,
  "total_load_mtd_inr": 45000,
  "device_id_hash": "a1b2c3d4",
  "last_ip_geo": "Mumbai",
  "exchange_frequency": 12
}
Used for: real-time fraud scoring (<200ms), low-latency inference
```

## 2.5 Security Design

### Authentication
- **Small PPI**: Mobile OTP (5-min expiry, max 5 retries, rate limited)
- **Full-KYC**: PAN (NSDL API, fuzzy match >85%), Aadhaar (offline XML, 344-char signature), Video-CIP (liveness + geo)

### Session Management
- JWT RS256, access token 15–30 min, refresh token rotation, HTTP-only cookies, optional device binding

### Authorization (RBAC)
| Role | Access |
|------|--------|
| USER | Own transactions & wallet only |
| MERCHANT | Partner settlement data only |
| COMPLIANCE_OFFICER | Flagged transactions, STR generation |
| ADMIN | System configurations |

### Encryption
- Transit: TLS 1.3, AES-256-GCM, HSTS, certificate pinning (mobile)
- Rest: AES-256, TDE for PostgreSQL, encrypted backups, Redis AUTH + TLS
- PAN: SHA-256 hash only. Aadhaar: never raw, masked/reference only

### API Security
- OAuth 2.0, JWT validation, HMAC request signing, rate limiting, parameterized queries
- Protection against: SQL injection, XSS, CSRF, DDoS

### Network
- Private VPC (AWS India), WAF, AWS Shield, restricted security groups, bastion host

### Financial Integrity
- Double-entry (total_debit = total_credit), ACID, serializable isolation, row-level locking

### Backup & DR
- Daily encrypted backups, Indian data centers, RPO ≤ 15 min, RTO ≤ 1 hour

## 2.6 Traceability Matrix (SRS → SDD Mapping)

### Functional Requirements
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-AUTH-01 | Mobile OTP Auth | D-CL-01, D-SQ-01 | Class Diagram (User, KYCValidator), Sequence Diagram |
| REQ-AUTH-02 | Small PPI Limit | D-DB-01, D-CL-02 | Wallet Table + Trigger, SmallKYCValidator |
| REQ-AUTH-03 | PAN Verification | D-INT-01, D-SQ-02 | Adapter Pattern (NSDL), KYC Sequence |
| REQ-AUTH-04 | Aadhaar XML Parsing | D-SEC-01, D-CL-03 | Masked Storage, User Entity |
| REQ-AUTH-05 | Video-CIP Geo | D-SEC-02, D-SQ-03 | Security Design + KYC Sequence |
| REQ-LEDG-01 | Double Entry Bookkeeping | D-DB-02, D-CL-04 | Journal_Entries & Ledger_Lines |
| REQ-PRICE-01 | DQN Pricing Model | D-CL-05 | PricingEngine + DQNModel |
| REQ-PRICE-02 | RL Reward Function | D-ALG-01 | Pricing Engine Design |
| REQ-COMP-01 | GST @18% | D-DB-03, D-SQ-04 | GST_Records, Taxation Sequence |
| REQ-COMP-02 | CGST/SGST/IGST Split | D-DB-04 | GST_Records Table |
| REQ-COMP-03 | STR Reporting | D-DB-05, D-SQ-05 | STR_Reports, Compliance Sequence |

### Fraud & ML Requirements
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-ML-01 | XGBoost Fraud Model | D-ML-01 | FraudScorer Class |
| REQ-ML-02 | Device Farming Detection | D-ML-02 | Redis Feature Store + Fraud Engine |
| REQ-ML-03 | Smurfing Detection | D-SQ-06 | Fraud Detection Sequence |
| REQ-ML-04 | Fraud Feature Inputs | D-DB-06 | Redis risk_profile:{user_id} |
| REQ-ML-05 | KL-Divergence Drift | D-ML-03 | Drift Detection Module |
| REQ-ML-06 | Auto Retraining Trigger | D-ML-04 | MLOps Workflow |

### Performance Requirements
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-PERF-01 | Fraud Latency <200ms | D-ARCH-01 | Redis Feature Store |
| REQ-PERF-02 | E2E <2 sec | D-SQ-01 | High-Throughput Sequence |
| REQ-PERF-03 | 5000 TPS | D-ARCH-02 | Microservices Architecture |
| REQ-PERF-04 | Horizontal Scaling | D-ARCH-03 | Stateless Services + LB |

### Database Requirements
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-DB-01 | PostgreSQL Ledger | D-DB-02 | PostgreSQL Schema |
| REQ-DB-02 | Redis Feature Store | D-ML-02 | Redis Architecture |
| REQ-DB-03 | Referential Integrity | D-DB-07 | Foreign Key Constraints |
| REQ-DB-04 | Debit = Credit | D-DB-08 | CHECK constraint |

### Audit & Compliance
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-AUD-01 | Immutable Audit Logs | D-DB-09 | Audit_Logs Table |
| REQ-AUD-02 | Log Metadata Fields | D-DB-09 | Audit Log Schema |
| REQ-AUD-03 | Log Retention | D-SEC-03 | Compliance Policy |
| REQ-LEG-01 | RBI PPI Compliance | D-ARCH-04 | Wallet Constraints + KYC |
| REQ-LEG-02 | GST Act Compliance | D-DB-03 | GST Tables |
| REQ-LEG-03 | PMLA Compliance | D-DB-05 | STR_Reports Table |

### Security & Privacy
| Req ID | Requirement | Design IDs | Artifacts |
|--------|------------|------------|-----------|
| REQ-PRIV-01 | PAN Hashing | D-SEC-04 | SHA-256 Hash Storage |
| REQ-PRIV-02 | Aadhaar Masking | D-SEC-01 | Masked Aadhaar Storage |
| REQ-PRIV-03 | PII Encryption | D-SEC-05 | AES-256 + TLS 1.3 |
| SEC-01 | JWT Auth | D-SEC-06 | JWT RS256 Design |
| SEC-02 | RBAC | D-SEC-07 | RBAC Module |

---

# PART 3: EXECUTION PLAN

**Source**: Comprehensive Implementation Execution and Project Management Plan (Google Docs)

## 3.1 Project Goal
Orchestrate a 5-member team to construct 90–95% of ILPEP within a GitHub repo. Maximize parallel productivity with bounded contexts to eliminate merge conflicts.

## 3.2 Five Architectural Layers
1. **Access & Frontend Layer** — Mobile apps + Web portal
2. **API Gateway Layer** — JWT validation, rate limiting, routing
3. **Core Application Services** — Identity/KYC, Partner Aggregation, Ledger
4. **Financial Ledger & Database Layer** — PostgreSQL, double-entry, ACID
5. **Intelligence & ML Layer** — XGBoost (fraud), DQN (pricing), Redis feature store
6. **Regulatory Integration Layer** — FIU-IND FINnet XML, GSTN

## 3.3 Module Breakdown
- **Ledger Accounting Service** — Double-entry, wallets, GST, atomicity
- **Partner Aggregation Service** — ETL, bank APIs, point normalization
- **API & Gateway Layer** — Rate limiting, JWT, CORS, RBAC
- **Database Schema & Models** — PostgreSQL DDL, migrations, Redis init
- **Frontend & UI** — React Native (mobile), React.js (web portal)
- **Intelligence & ML** — XGBoost, DQN, Redis feature store, MLOps
- **DevOps & Compliance** — Docker, K8s, GitHub Actions, FINnet XML

## 3.4 Detailed Work Division — All 5 Members

### MEMBER 1: Lead Financial Backend Architect (YOUR ROLE)
**Primary Domain**: `ledger-accounting-service` + PostgreSQL schema
**Responsibilities**:
- PostgreSQL DDL migration scripts (all 11 tables)
- Database-level triggers & CHECK constraints (debit = credit)
- `CommitExchangeTransaction()` — atomic function:
  - Debit user points liability
  - Apply DQN exchange rate
  - Deduct partner points
  - Credit user wallet
  - Calculate 18% GST (CGST/SGST/IGST by state_code)
  - Full rollback on failure
- Financial accuracy integration tests (concurrent transactions)
- Row-level locking, serializable isolation

**Directory**:
```
/ledger-accounting-service/
├── db/migrations/001_initial_schema.sql
├── db/migrations/002_tax_compliance.sql
├── models/journal_entry.go
├── models/ledger_line.go
├── services/transaction_processor.go
├── handlers/exchange_handler.go
└── tests/acid_concurrency_test.go
```

**Dependencies**: Partner aggregation service (finalize external deductions before commit)

---

### MEMBER 2: Security and Identity Engineer
**Domain**: `gateway-auth-service` + `kyc-identity-service`
**Responsibilities**:
- API Gateway (Node.js): rate limiting, JWT RS256, CORS
- NSDL PAN verification (fuzzy match >85%)
- Aadhaar offline XML parsing (344-char signature validation, no raw Aadhaar storage)
- Video-CIP geo validation
- RBAC enforcement (USER, MERCHANT, COMPLIANCE_OFFICER, ADMIN)
- Penetration testing of auth endpoints

**Directory**:
```
/gateway-auth-service/middleware/jwt_validator.js
/gateway-auth-service/middleware/rate_limiter.js
/kyc-identity-service/controllers/nsdl_pan_verification.js
/kyc-identity-service/controllers/aadhaar_xml_parser.js
/kyc-identity-service/utils/crypto_hashing.js
/kyc-identity-service/utils/fuzzy_name_matcher.js
/kyc-identity-service/tests/signature_validation_test.js
```

**Dependencies**: None (provides session context to all others)

---

### MEMBER 3: AI/ML Integration Engineer
**Domain**: `intelligence-ml-service`
**Responsibilities**:
- XGBoost fraud classifier API (<200ms latency)
- DQN pricing agent (reward function: maximize revenue, penalize illiquid inventory)
- Redis feature store (background workers for velocity metrics, device fingerprints)
- MLOps: KL-Divergence drift monitoring, auto-retraining if drift > 0.1
- FastAPI endpoints for fraud scoring + dynamic pricing

**Directory**:
```
/intelligence-ml-service/
├── api/fraud_scoring_routes.py
├── api/dynamic_pricing_routes.py
├── core/redis_feature_store.py
├── models/xgboost_fraud_classifier_v1.pkl
├── models/dqn_pricing_agent_v1.pt
├── workers/kl_divergence_monitor.py
└── tests/inference_latency_test.py
```

**Dependencies**: API Gateway for transaction events (asynchronous)

---

### MEMBER 4: Frontend and UI Developer
**Domain**: React Native mobile + React.js web portal
**Responsibilities**:
- Mobile: OTP login, V-CIP camera, Aadhaar upload, wallet dashboard, exchange interface
- Web portal: Compliance dashboard, fraud investigation modal
- State management (Redux/Context API)
- Cross-device testing, mock interfaces

**Directory**:
```
/frontend-mobile-app/src/screens/KYCVerificationScreen.tsx
/frontend-mobile-app/src/screens/WalletDashboardScreen.tsx
/frontend-mobile-app/src/screens/ExchangeQuoteScreen.tsx
/frontend-mobile-app/src/store/slices/walletSlice.ts
/frontend-web-portal/src/pages/ComplianceDashboard.tsx
/frontend-web-portal/src/components/FraudInvestigationModal.tsx
/frontend-web-portal/src/services/apiClient.ts
```

**Dependencies**: API contracts from Members 1, 2, 3

---

### MEMBER 5: DevOps, Compliance & Integrations Engineer
**Domain**: Infrastructure, partner adapters, compliance reporting
**Responsibilities**:
- Docker Compose, Kubernetes manifests, GitHub Actions CI/CD
- `compliance-reporting-service`: FIU-IND FINnet XML generation (STR)
- `partner-aggregation-service`: Adapter Pattern for HDFC/SBI APIs, ETL normalization
- WireMock for development mocking
- Integration testing

**Directory**:
```
/infrastructure-ops/docker-compose.yml
/infrastructure-ops/.github/workflows/ci-pipeline.yml
/infrastructure-ops/k8s-manifests/api-gateway-deployment.yaml
/compliance-reporting-service/fiu_ind_generator/xml_schema_builder.py
/compliance-reporting-service/fiu_ind_generator/str_batch_processor.py
/partner-aggregation-service/adapters/hdfc_loyalty_adapter.py
/partner-aggregation-service/etl/point_value_normalizer.py
```

---

## 3.5 GitHub Workflow Strategy

### Branching Architecture
- **`main`**: Production-ready, immutable. Modified only via merges.
- **`develop`**: Integration/staging. All features merge here first.
- **Feature branches**: `feature/<module>-<description>` (e.g., `feature/ledger-gst-computation`)
- **Hotfix branches**: `hotfix/<issue-id>` — branch from main, merge to both main and develop

### PR Workflow
1. Open PR → triggers CI pipeline (tests, linting, SonarQube)
2. Block merge if tests fail or coverage < 80%
3. Mandatory peer review (e.g., ledger changes need Member 1 approval)
4. Rebase against develop before merge
5. **Squash and Merge** — single descriptive commit on develop

### Parallel Development Strategy
- **API-First**: Define OpenAPI/Swagger specs before writing code
- **WireMock**: Centralized mock container for development
- **Database Decoupling**: ML uses Redis independently from PostgreSQL

## 3.6 Milestone Plan (4 Phases)

### Phase 1: Project Setup & Contract Definition
- GitHub repo init, branch protection, directory structures
- Docker Compose environments
- OpenAPI spec finalization
- Member 1: Initial PostgreSQL DB + DDL scripts (users, wallets)
- **Exit**: Runnable but empty microservice skeleton

### Phase 2: Core Module Implementation
- Member 1: Double-entry accounting + GST computation
- Member 2: JWT middleware + NSDL/Aadhaar parsing
- Member 3: XGBoost + DQN FastAPI endpoints + Redis feature store
- Member 4: React Native screens + Redux state
- Member 5: Partner adapter stubs + Docker configs
- **Exit**: Each service passes localized unit tests independently

### Phase 3: System Integration & Compliance
- KYC → Ledger integration (enforce PPI limits)
- Partner Aggregation → Ledger (end-to-end exchange)
- Fraud Detection → Transaction flow (score before commit)
- Compliance module activation (flagged → STR XML)
- **Exit**: Complete transaction flow: login → fraud → ledger → reporting

### Phase 4: Hardening, E2E Testing & UAT
- Replace mocks with actual service-to-service communication
- Load testing (5,000 TPS)
- Security vulnerability testing
- Reconciliation tests (internal vs external balances)
- **Exit**: Production-ready, load-tested system

## 3.7 Expected Final State (90–95% completion)
- Containerized app suite: mobile app + web portal + 5 backend microservices
- Full auth, KYC, exchange, fraud, pricing, compliance flow
- Remaining 5–10%: Live production credentials (NSDL/UIDAI), partner agreements, CERT-In audit, merchant dashboards, DR runbooks

---

# PART 4: CURRENT REPO STATE

**GitHub**: https://github.com/adityakryadav/project-point-ledger
**Current Commits**: 1 commit on `main`
**Current Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Framer Motion, Recharts, Lucide React

### Existing Directory Structure
```
├── app/              # Next.js app router pages
│   ├── page.tsx      # Landing page
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # User dashboard
│   ├── aggregation/  # Loyalty aggregation
│   ├── exchange/     # Exchange flow
│   ├── ledger/       # Transaction ledger
│   ├── fraud/        # Fraud detection
│   ├── compliance/   # Compliance dashboard
│   ├── pricing/      # Pricing engine
│   └── analytics/    # System analytics
├── components/
│   ├── ui/           # Button, Card, Badge, Input, Modal, ProgressBar
│   ├── pages/        # Page components
│   └── layout/       # Layout components
├── lib/
│   └── utils.ts
├── .gitignore
├── README.md
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Key Pages (Existing Routes)
- `/` — Landing page
- `/auth` — Authentication & KYC
- `/dashboard` — User dashboard
- `/aggregation` — Loyalty aggregation
- `/exchange` — Exchange flow
- `/ledger` — Transaction ledger
- `/fraud` — Fraud detection
- `/compliance` — Compliance dashboard (Admin)
- `/pricing` — Pricing engine (Admin)
- `/analytics` — System analytics (Admin)

---

# PART 5: QUICK REFERENCE — KEY NUMBERS

| Metric | Value |
|--------|-------|
| Monthly load limit (Small PPI) | ₹10,000 |
| Yearly load limit (Small PPI) | ₹1,20,000 |
| Max wallet balance (Full KYC) | ₹2,00,000 |
| GST rate | 18% (9% CGST + 9% SGST or 18% IGST) |
| GST SAC code | 9971 |
| Fraud scoring latency target | < 200ms |
| E2E transaction time | < 2 seconds |
| Throughput target | 5,000 TPS |
| Uptime target | 99.9% |
| JWT access token expiry | 15–30 minutes |
| OTP expiry | 5 minutes |
| OTP max retries | 5 |
| PAN fuzzy match threshold | > 85% similarity |
| KL-Divergence retrain threshold | > 0.1 |
| Test coverage minimum | 80% |
| RPO | ≤ 15 minutes |
| RTO | ≤ 1 hour |
| STR trigger (Small PPI) | txn > ₹50,000 |
| Unredeemed loyalty market size | ~₹15,000 Crore/year |

---

# PART 6: MEMBER 3 — AI/ML INTEGRATION ENGINEER (YOUR SECONDARY ROLE)

## 6.1 Role Summary
Member 3 sits at the intersection of data science and production software engineering.
Primary objective: construct the `intelligence-ml-service`, transforming theoretical ML models
into robust, low-latency API endpoints that actively secure and optimize the ILPEP transactional flow.
All AI components must operate under **financial-grade reliability** (<200ms inference latency).

## 6.2 Two Core AI Paradigms

### A. XGBoost Fraud Detection Classifier
**Purpose**: Evaluate real-time transaction requests against known Indian financial fraud vectors.
**Fraud Types Detected**:
- **UPI referral abuse** — exploiting referral bonus schemes
- **Smurfing** — rapid transaction structuring (multiple small txns to avoid detection thresholds)
- **Device farming** — geographically dispersed devices used to simulate multiple users
- **Velocity anomalies** — unusual transaction frequency patterns

**How It Works**:
1. Transaction request arrives
2. Background worker retrieves user's `risk_profile:{user_id}` from Redis feature store
3. Feature vector is constructed from: transaction velocity, device fingerprint hash, amount, geo, frequency
4. Pre-loaded XGBoost model scores the transaction
5. Returns normalized fraud probability score: **0.0 (safe) → 1.0 (fraud)**
6. Decision: `AUTHORIZED` / `FLAGGED` / `BLOCKED`

**Key Function**:
```python
async def CalculateFraudProbability(user_id: str, device_hash: str, amount: float) -> float:
    """
    1. Retrieve velocity metrics from Redis key risk_profile:{user_id}
    2. Format the feature vector
    3. Pass through pre-loaded XGBoost model
    4. Return normalized risk score (0.0 to 1.0)
    """
```

**Model File**: `xgboost_fraud_classifier_v1.pkl` (serialized with joblib/pickle)

### B. Deep Q-Network (DQN) Pricing Agent
**Purpose**: Continuously analyze market liquidity and point inventory to dynamically formulate optimal exchange rate quotes.

**Reward Function Design** (balances 3 objectives):
1. **Maximize fiat revenue** — higher exchange rates = more platform revenue
2. **Penalize illiquid inventory accumulation** — don't hoard points that can't be redeemed
3. **User retention** — fair pricing keeps users on platform

**How It Works**:
1. User requests exchange of loyalty points for wallet credits
2. DQN agent evaluates: current market liquidity, point inventory levels, user history
3. Agent outputs optimal exchange rate (pricing multiplier)
4. **Time-bound quote** with cooldown mechanism to prevent arbitrage
5. If user accepts within the time window, transaction proceeds at quoted rate

**Model File**: `dqn_pricing_agent_v1.pt` (PyTorch serialized)

## 6.3 Redis Feature Store Architecture

**Purpose**: High-speed in-memory data store for real-time ML inference (<200ms).

**Key Schema**:
```
Key:   risk_profile:{user_id}
Type:  Hash / JSON

Fields:
{
    "velocity_1h": 15,              // transactions in last 1 hour
    "velocity_24h": 45,             // transactions in last 24 hours
    "total_load_mtd_inr": 45000,    // month-to-date load in INR
    "device_id_hash": "a1b2c3d4",   // current device fingerprint
    "device_count_30d": 3,          // unique devices in last 30 days
    "last_ip_geo": "Mumbai",        // last known IP geolocation
    "exchange_frequency": 12,       // exchanges this month
    "avg_txn_amount": 2500.00,      // average transaction amount
    "last_txn_timestamp": "2026-03-15T14:30:00Z"
}
```

**Background Workers**: Continuously update these profiles from transaction events.
- Pull from PostgreSQL exchange_transactions + audit_logs
- Update rolling metrics (velocity, frequency, device counts)
- Expire stale data after configurable TTL

## 6.4 MLOps Pipeline

### KL-Divergence Drift Monitoring
**What**: Measures statistical divergence between training data distribution and live production data.
**Formula**: KL(P || Q) = Σ P(x) * log(P(x) / Q(x))
**Threshold**: If KL-Divergence > **0.1**, auto-trigger model retraining.
**Frequency**: Calculated weekly.

**Why It Matters**: Fraud patterns evolve. If the production data distribution shifts significantly
from the training data, the model's accuracy degrades → the system must detect this and retrain.

### Auto Retraining Workflow
1. Weekly KL-Divergence calculation (training vs production distributions)
2. If drift > 0.1 threshold → trigger retraining pipeline
3. Retrain XGBoost on latest labeled data
4. Validate new model on holdout set
5. If validation metrics pass → deploy new model version
6. Update `model_version` in fraud_logs for traceability

## 6.5 API Endpoints (FastAPI)

### Fraud Scoring Endpoint
```
POST /api/v1/fraud/score
Request:
{
    "user_id": "uuid",
    "device_hash": "string",
    "amount_inr": 5000.00,
    "source_partner_id": "uuid",
    "ip_address": "string",
    "timestamp": "ISO8601"
}
Response:
{
    "fraud_score": 0.23,
    "decision": "AUTHORIZED",  // AUTHORIZED | FLAGGED | BLOCKED
    "model_version": "v1.2",
    "inference_time_ms": 45,
    "risk_factors": ["velocity_normal", "known_device"]
}
```

### Dynamic Pricing Endpoint
```
POST /api/v1/pricing/quote
Request:
{
    "user_id": "uuid",
    "source_partner_id": "uuid",
    "source_points": 5000,
    "point_type": "CREDIT_CARD_REWARDS"
}
Response:
{
    "exchange_rate": 0.4200,        // 1 point = ₹0.42
    "gross_value_inr": 2100.00,
    "quote_valid_until": "ISO8601", // time-bound (e.g., 5 min)
    "cooldown_seconds": 300,
    "model_version": "dqn_v1.0"
}
```

## 6.6 Directory Structure
```
/intelligence-ml-service/
├── api/
│   ├── fraud_scoring_routes.py        # FastAPI routes for fraud scoring
│   └── dynamic_pricing_routes.py      # FastAPI routes for dynamic pricing
├── core/
│   ├── redis_feature_store.py         # Redis connection, read/write, TTL management
│   ├── feature_engineering.py         # Transform raw data → ML feature vectors
│   └── config.py                      # Model paths, Redis config, thresholds
├── models/
│   ├── xgboost_fraud_classifier_v1.pkl  # Serialized XGBoost model
│   ├── dqn_pricing_agent_v1.pt          # Serialized DQN PyTorch model
│   └── model_registry.py               # Model versioning & loading
├── workers/
│   ├── kl_divergence_monitor.py       # Weekly drift detection
│   ├── feature_store_updater.py       # Background worker to update Redis profiles
│   └── retraining_trigger.py          # Auto-retraining pipeline
├── training/
│   ├── train_xgboost.py               # XGBoost training script
│   ├── train_dqn.py                   # DQN training script
│   └── data/                          # Training datasets (synthetic for dev)
├── tests/
│   ├── inference_latency_test.py      # Verify <200ms latency under load
│   ├── fraud_score_accuracy_test.py   # Model accuracy assertions
│   ├── dqn_reward_test.py             # Reward function math correctness
│   └── redis_feature_store_test.py    # Feature store read/write tests
├── requirements.txt                   # Python dependencies
├── Dockerfile                         # Container definition
└── README.md
```

## 6.7 Tech Stack (Member 3)
| Tool | Purpose |
|------|---------|
| **Python 3.10+** | Primary language |
| **FastAPI** | Microservice framework (async, high-performance) |
| **XGBoost** | Fraud detection classifier |
| **PyTorch** | Deep Q-Network (DQN) for pricing |
| **Redis** (redis-py / aioredis) | In-memory feature store |
| **scikit-learn** | Feature preprocessing, metrics |
| **NumPy / Pandas** | Data manipulation |
| **joblib / pickle** | Model serialization |
| **pytest** | Testing framework |
| **Docker** | Containerization |

## 6.8 Member 3 Responsibilities Per Phase

### Phase 1: Setup
- [ ] Set up `intelligence-ml-service` directory structure
- [ ] Install Python dependencies (FastAPI, XGBoost, PyTorch, Redis)
- [ ] Define OpenAPI specs for fraud scoring & pricing endpoints
- [ ] Initialize Redis connection and feature store schema
- [ ] Create Dockerfile for the ML service

### Phase 2: Core Implementation
- [ ] Train & serialize XGBoost fraud classifier (on synthetic data)
- [ ] Train & serialize DQN pricing agent
- [ ] Implement `fraud_scoring_routes.py` — FastAPI endpoint
- [ ] Implement `dynamic_pricing_routes.py` — FastAPI endpoint
- [ ] Implement `redis_feature_store.py` — CRUD for risk profiles
- [ ] Implement `feature_store_updater.py` — background worker
- [ ] Implement DQN reward function (revenue vs. illiquidity vs. retention)
- [ ] Write unit tests: latency, accuracy, reward math
- [ ] **Exit**: Each endpoint passes localized tests independently

### Phase 3: Integration
- [ ] Collaborate with Member 1 to inject fraud scoring INTO the transaction flow
  - Fraud score must be evaluated BEFORE ledger commit
  - If score > threshold → BLOCK or FLAG the transaction
- [ ] Connect pricing endpoint to exchange flow (DQN provides rate to ledger)
- [ ] Wire background workers to consume real transaction events
- [ ] Implement `kl_divergence_monitor.py` — weekly drift checks

### Phase 4: Hardening
- [ ] Load test inference endpoints (verify <200ms under 5000 TPS)
- [ ] Validate fraud model accuracy on holdout test data
- [ ] Test auto-retraining pipeline end-to-end
- [ ] Verify Redis feature store resilience (TTL, connection drops)

## 6.9 Key Integration Points (Member 1 ↔ Member 3)

The most critical collaboration is between Member 1 (Ledger) and Member 3 (ML):

```
Transaction Flow with Fraud Injection:

1. User initiates exchange → API Gateway
2. Gateway calls Member 3's fraud endpoint:
   POST /api/v1/fraud/score {user_id, device_hash, amount}
3. Member 3 returns: {fraud_score: 0.82, decision: "BLOCKED"}
4. If BLOCKED → Member 1's ledger REJECTS the transaction
   If FLAGGED → Member 1 commits but marks txn_status = 'FLAGGED'
   If AUTHORIZED → Member 1 proceeds with normal commit

Pricing Flow:
1. User requests exchange quote
2. Gateway calls Member 3's pricing endpoint:
   POST /api/v1/pricing/quote {source_points, partner_id}
3. Member 3 returns: {exchange_rate: 0.42, valid_until: "..."}
4. User accepts → Member 1 uses this rate in CommitExchangeTransaction()
```

## 6.10 Quick Reference — ML Thresholds

| Metric | Value |
|--------|-------|
| Fraud score range | 0.0 (safe) → 1.0 (fraud) |
| Fraud inference latency | < 200ms |
| KL-Divergence retrain threshold | > 0.1 |
| Drift check frequency | Weekly |
| Quote cooldown (arbitrage prevention) | Configurable (e.g., 300 seconds) |
| Redis key format | `risk_profile:{user_id}` |
| Model files | `.pkl` (XGBoost), `.pt` (DQN/PyTorch) |
