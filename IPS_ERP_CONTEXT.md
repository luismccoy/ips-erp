# 🏥 IPS ERP: AI-Native Home Care SaaS for Colombia
**Comprehensive Research, Architecture & Technical Documentation**
**Date:** January 20, 2026
**Target Market:** Colombia (Sector Salud / Atención Domiciliaria)
**Cloud Strategy:** AWS Exclusive (Amplify Gen 2 + Bedrock)

---

## 1. Executive Summary

This document consolidates the research, architectural decisions, and prototyping efforts for **IPS ERP**, a SaaS platform designed for Colombian Home Care Agencies.

**The Pivot:** We shifted from a simple "Nurse Log" app to an **"Admin-First" ERP**. The primary goal is not just logging visits, but active **Resource Optimization** and **Liability Protection**.

**The Solution:** An AI-Native platform where the Admin uses **AWS Bedrock Agents** to automate Rostering, defend against Billing Rejections ("Glosas"), and stop Inventory Leakage. The Field Nurse uses an **Offline-First Mobile App** that guarantees legal proof of attendance.

---

## 2. Key Findings & Detailed Specifications

### A. Market & Regulatory Context (Colombia)
To succeed, the software must automate compliance with strict local regulations. Failure to do so results in non-payment (Glosas) or closure (Habilitación).

* **Resolución 3100 (Habilitación):** Agencies must maintain logs for biomedical equipment maintenance (calibrations) and Human Talent certifications (ReTHUS).
* **Resolución 2275 (RIPS JSON):** The Ministry of Health requires billing data (RIPS) to be submitted in a specific JSON structure. *Feature: The app acts as a pre-validator to prevent rejections.*
* **Tecnovigilancia:** Mandatory reporting of adverse events related to equipment failure.
* **Data Residency:** Compliance with Colombian data handling standards suggests prioritizing **AWS Local Zones (Bogotá)** where possible.

### B. User Personas & Requirements

| Persona | Primary Goal | Critical Features |
| :--- | :--- | :--- |
| **Agency Owner (Admin)** | Protect Margin & Liability | KPI Dashboard, AI Roster, Glosa Defense, Inventory Control. |
| **Field Nurse** | Ease of Use & Payment | Offline Mode ("Zona Roja"), Voice-to-Text Notes, Digital Kardex. |
| **Family** | Peace of Mind | View-only portal for "Nurse Arrival" status. |

### C. Technical Architecture (AWS Serverless)

We selected **AWS Amplify Gen 2** for rapid development and enterprise scale.

* **Authentication:** **Amazon Cognito** (User Pools).
    * *Strategy:* Logical isolation via custom attribute `tenantId`.
* **Database:** **Amazon DynamoDB**.
    * *Pattern:* Single Table Design heavily partitioned by `tenantId`.
* **API & Sync:** **AWS AppSync** (GraphQL).
    * *Capabilities:* Native offline synchronization and conflict resolution for the Nurse App.
* **Geo-Location:** **Amazon Location Service**.
    * *Usage:* Calculating drive-time matrices for rostering and validating GPS geofences for visit proof.

### D. AI Strategy: "AI as an Employee" (AWS Bedrock)

We are moving beyond chatbots to **Autonomous Agents** that execute workflows.

1.  **Agent A: "The Roster Architect" (Claude 3.5 Sonnet)**
    * *Task:* Autonomously assigns shifts.
    * *Logic:* Balances *Nurse Skills* + *Travel Costs* (Location Service) + *Continuity of Care*.
2.  **Agent B: "The Glosa Defender" (Titan Text/Claude)**
    * *Task:* Generates legal/clinical justification letters for billing disputes.
    * *RAG Source:* Patient Vitals History + "Manual de Auditoría" (Knowledge Base).
3.  **Agent C: "The Data Janitor" (Data Hygiene)**
    * *Task:* Nightly audit. Scans Clinical Notes vs. Inventory usage.
    * *Alert:* "Nurse logged 'Injection' but did not deduct 'Syringe' from inventory -> Potential Theft."

### E. The "Money Modules" (Features)

1.  **Supply Chain ("The Farmacia"):** Tracks inventory via a "Digital Kardex." Clinical procedures automatically deduct Bill-of-Materials (BOM) from stock.
2.  **Evidence Packets:** Auto-generates PDFs containing GPS timestamps, digital signatures, and clinical notes to prove service delivery.
3.  **RIPS Validator:** A strict engine ensuring JSON output matches Resolution 2275 technical annexes.

---

## 3. Gap Analysis & Audit Findings

An audit of the prototype against industry standards revealed the following:

* **Critical Gap (Fixed):** **Offline Mode**. The initial prototype assumed connectivity. The new architecture uses AppSync local caching to support nurses in rural areas ("Zonas Rojas").
* **Critical Gap (Fixed):** **Inventory/Farmacia**. Added to the Admin Dashboard to prevent "Inventory Shrinkage" (Theft), a major source of margin loss.
* **Infrastructure:** To meet data residency expectations, the architecture must leverage **AWS Local Zones in Bogotá**.
* **Security:** Must adopt standard AWS Healthcare Compliance patterns (encryption at rest/transit, audit trails via CloudWatch).

---

## 4. Master Context File (For AI IDEs)

*Save this block as `PROJECT_CONTEXT.md` to bootstrap your AI IDE (Cursor/Windsurf) with full context.*

```markdown
# 🏥 PROJECT MASTER CONTEXT: IPS ERP
**Type:** SaaS ERP for Home Care (Colombia).
**Architecture:** AWS Amplify Gen 2, Cognito, DynamoDB, Bedrock.

## Data Dictionary
* `Tenant`: { id, name, nit }
* `Nurse`: { id, tenantId, skills: [], location: {lat, lng} }
* `Shift`: { id, tenantId, status, gpsData, clinicalNote }
* `Inventory`: { id, tenantId, sku, stockCount }

## Core Rules
1. **Multi-Tenancy:** ALL database queries MUST be filtered by `tenantId`.
2. **Offline-First:** Nurse App features must work without network.
3. **Compliance:** RIPS JSON must match Res 2275 schema.
4. **AI Agents:** Use Bedrock Agents for complex logic (Rostering/Auditing), not client-side code.

```

---

## 5. References & Sources

* **Workforce Modernization:** [SENA Modernizes Colombia's ICT Workforce (AWS)](https://aws.amazon.com/solutions/case-studies/sena-case-study/) - Validates the need for simple, mobile-first UI for field staff.
* **Infrastructure:** [AWS Announces Local Zones in Latin America (Bogotá)](https://aws.amazon.com/blogs/publicsector/aws-announces-local-zones-latin-america/) - Critical for data residency compliance.
* **Compliance:** [AWS Healthcare Compliance Patterns](https://aws.amazon.com/health/healthcare-compliance/) - Security baseline standards.
* **Research Tools:** [AI Chat Exporter](https://chromewebstore.google.com/detail/ai-chat-export-to-markdow/hplmipgfjgahiabdlppckdjmckjbgbac?hl=en) - Methodology for documenting this research.

---

## 6. Conclusion & Next Steps

We have successfully defined the **Product Market Fit** (Admin-First), the **Technical Stack** (AWS Serverless), and the **AI Strategy** (Agents). The prototype code (`App.jsx`) is ready for visual reference, and the Technical Spec (`IPS_ERP_TECHNICAL_SPEC_V3.md`) is ready for engineering.

**Immediate Action Plan:**

1. **Phase 1 (Foundation):** Initialize the AWS Amplify Gen 2 project and deploy the GraphQL Schema.
2. **Phase 2 (Core Ops):** Build the Offline Nurse App logic.
3. **Phase 3 (AI Integration):** Deploy the Bedrock "Roster Architect" Agent.
