# 📌 IPS‑ERP Project Scope (Permanent Reference)

**Purpose**: This document serves as the single source of truth for the scope, requirements, architecture, and constraints of the **IPS ERP** project. All future development, design decisions, and feature additions must be evaluated against the content below to ensure we stay within the defined scope.

---

## 1️⃣ Original Context (Extracted from `IPS_ERP_CONTEXT.md`)

- **Target Market**: Colombian home‑care agencies (Sector Salud / Atención Domiciliaria).
- **Regulatory Drivers**: Resolución 3100 (equipment & talent certification), Resolución 2275 (RIPS JSON billing), Tecnovigilancia, data‑residency in Bogotá.
- **Core Personas**:
  - **Agency Owner / Admin** – KPI dashboard, AI‑driven roster, inventory control, glosa defense.
  - **Field Nurse** – Offline‑first mobile app, voice‑to‑text notes, digital Kardex, proof‑of‑service packets.
  - **Family** – View‑only portal for visit status.
- **Technical Stack**:
  - **AWS Amplify Gen 2** (Cognito, DynamoDB, AppSync, Location Service).
  - **AI Agents (Bedrock)**: Roster Architect (Claude 3.5 Sonnet), Glosa Defender, Data Janitor.
  - **Offline‑First** via AppSync local cache.
- **Key “Money Modules”**:
  1. **Supply‑Chain / Farmacia** – digital Kardex, automatic BOM deduction.
  2. **Evidence Packets** – PDFs with GPS timestamps, signatures, clinical notes.
  3. **RIPS Validator** – strict JSON output matching Resolution 2275.
- **Security & Compliance**: Encryption at rest & in‑transit, CloudWatch audit trails, AWS Local Zones (Bogotá) for data residency.

---

## 2️⃣ Scope Boundaries

- **In‑Scope**:
  - All features listed in the original context (admin‑first ERP, AI agents, offline nurse app, inventory, roster, evidence packets, RIPS validation).
  - Implementation must use **AWS Amplify Gen 2** and **Bedrock agents** as the primary platform.
  - UI must follow the **premium, modern aesthetic** guidelines already applied (gradient cards, micro‑animations, dark‑mode ready).
- **Out‑Of‑Scope** (for now):
  - Full EMR/FHIR integration (can be added later as an extension).
  - Multi‑tenant billing/insurance gateway beyond the RIPS validator.
  - Third‑party SaaS marketplace integrations.
  - Desktop‑only or non‑web client platforms (mobile web only).

---

## 3️⃣ Guiding Principles

1. **Stay Within the Defined Context** – Any new module must map back to a requirement in Section 1 or be justified as a future‑phase extension.
2. **Security First** – All data handling must respect Colombian health‑data regulations and AWS compliance patterns.
3. **AI‑Native** – Leverage Bedrock agents for complex logic; avoid moving that logic to the client.
4. **Offline‑First for Nurses** – All nurse‑side interactions (patient notes, inventory deductions, GPS proof) must work without network connectivity.
5. **Premium UI** – Continue using the rich design system (gradients, glass‑morphism, micro‑animations) already established.

---

## 4️⃣ Immediate Action Items (Next Sprint)

- Implement **Patient Dashboard** for nurses (patient list, medication schedule, tasks).
- Wire up **Roster Architect** UI to trigger Bedrock agent and display generated schedule.
- Extend **Inventory** with auto‑reorder thresholds and expiration alerts.
- Add **Staff Management** (profiles, certifications, RBAC groups).
- Build a **Reporting Dashboard** for admin KPI visibility.

---

*All future work should reference this file to verify alignment with the project’s defined scope.*
