# External Integrations Specification for IPS-ERP
## Colombian Healthcare Compliance

**Version:** 1.0  
**Date:** January 26, 2026  
**Author:** External Integrations Architect  
**Status:** Research Complete - Ready for Implementation Planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Integration Architecture Overview](#integration-architecture-overview)
3. [ADRES Integration (BDUA)](#1-adres-integration-bdua)
4. [RIPS Electronic Invoicing](#2-rips-electronic-invoicing-resolución-2275)
5. [MIPRES Integration](#3-mipres-integration)
6. [HL7 FHIR / IHCE Integration](#4-hl7-fhir--ihce-integration)
7. [SISPRO Platform Integration](#5-sispro-platform-integration)
8. [EPS Connector Strategy](#6-eps-connector-strategy)
9. [Terminology & Codification Systems](#7-terminology--codification-systems)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Security & Compliance Requirements](#security--compliance-requirements)
12. [Appendix: Regulatory References](#appendix-regulatory-references)

---

## Executive Summary

This document specifies the external integrations required for IPS-ERP to achieve full compliance with Colombian healthcare regulations. The Colombian healthcare system (SGSSS - Sistema General de Seguridad Social en Salud) mandates several integrations for IPS (Instituciones Prestadoras de Servicios de Salud) operations.

### Critical Integrations (Priority Order)

| Priority | Integration | Purpose | Regulatory Mandate | Deadline |
|----------|-------------|---------|-------------------|----------|
| **P0** | RIPS JSON (Res. 2275) | Electronic billing + clinical data | Resolución 2275/2023, 1884/2024 | Active (phased) |
| **P1** | ADRES/BDUA | Patient eligibility verification | Resolución 4622/2016 | Immediate |
| **P2** | MIPRES | Non-PBS prescriptions/authorizations | Decreto 780/2016 | Immediate |
| **P3** | HL7 FHIR/RDA | Clinical data interoperability | Resolución 1888/2025, Ley 2015/2020 | 6 months from Oct 2025 |
| **P4** | SISPRO/RUAF | Affiliation verification | Multiple | As needed |

---

## Integration Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IPS-ERP SYSTEM                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Patient    │  │   Clinical   │  │   Billing    │              │
│  │  Management  │  │    Module    │  │    Module    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│  ┌──────┴─────────────────┴─────────────────┴──────┐               │
│  │            INTEGRATION LAYER (API Gateway)       │               │
│  └──────┬─────────────────┬─────────────────┬──────┘               │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │   ADRES   │     │  MIPRES   │     │   DIAN    │
    │   BDUA    │     │    API    │     │  FEV XML  │
    └───────────┘     └───────────┘     └───────────┘
          │                 │                 │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │  SISPRO   │     │    EPS    │     │  MinSalud │
    │   RUAF    │     │ Portals   │     │ RIPS JSON │
    └───────────┘     └───────────┘     └───────────┘
                            │
                      ┌─────┴─────┐
                      │  HL7 FHIR │
                      │   IHCE    │
                      └───────────┘
```

---

## 1. ADRES Integration (BDUA)

### Purpose
ADRES (Administradora de los Recursos del Sistema General de Seguridad Social en Salud) manages the BDUA (Base de Datos Única de Afiliados) - the single database of all affiliates to the Colombian social security health system.

### Use Cases
- **Patient eligibility verification** - Verify patient affiliation before service
- **EPS identification** - Determine which EPS is responsible for payment
- **Regime identification** - Contributivo, Subsidiado, Excepción, Especiales

### API Details

#### Official Web Portal (Manual)
- **URL**: `https://aplicaciones.adres.gov.co/BDUA_Internet/Pages/ConsultarAfiliadoWebBDEX.aspx`
- **URL**: `https://servicios.adres.gov.co/BDUA/Consulta-Afiliados-BDUA`
- **Documentation**: `https://www.adres.gov.co/eps/procesos/bdua`

#### Third-Party API Provider (Apitude)
For programmatic access, third-party services like Apitude provide REST APIs:

```
Endpoint: POST https://apitude.co/api/v1.0/requests/adres-co/
Headers:
  - x-api-key: {API_KEY}
  - Content-Type: application/json

Request Body:
{
  "document_type": "cedula",  // cedula, ti, ce, pa, rc, ms, as, pe, pt, sc
  "document_number": "123456789"
}

Response:
{
  "result": {
    "data": {
      "nombres": "JOHN",
      "apellidos": "DOE PEREZ",
      "municipio": "BOGOTA D.C.",
      "departamento": "BOGOTA D.C.",
      "estado_afiliacion": {
        "estado": "ACTIVO",
        "entidad": "EPS SURAMERICANA S.A.",
        "regimen": "CONTRIBUTIVO",
        "tipo_de_afiliado": "COTIZANTE",
        "fecha_de_afiliacion_efectiva": "2005-02-01",
        "fecha_de_finalizacion_de_afiliacion": "2999-12-31"
      },
      "fecha_de_nacimiento": "1975-06-03",
      "tipo_de_identificacion": "cedula",
      "numero_de_identificacion": "123456789"
    },
    "status": 200,
    "message": "successful"
  }
}
```

### Implementation Approach

#### Option A: Direct ADRES Integration (Recommended for Scale)
- Register with ADRES as IPS
- Obtain web service credentials
- Implement SOAP/REST client
- **Effort**: 3-4 weeks
- **Cost**: Registration fees only

#### Option B: Third-Party Provider (Quick Start)
- Use Apitude or similar
- **Effort**: 1 week
- **Cost**: Per-query fees (~$0.10-0.50 COP per query)

### Data Format
- **Request**: JSON
- **Response**: JSON
- **Encoding**: UTF-8

### Required Credentials
1. IPS registration in REPS (Registro Especial de Prestadores)
2. Digital certificate for web services
3. ADRES portal credentials

---

## 2. RIPS Electronic Invoicing (Resolución 2275)

### Purpose
RIPS (Registros Individuales de Prestación de Servicios de Salud) is the mandatory system for reporting all healthcare services rendered. Resolución 2275 de 2023 modernizes RIPS to be the electronic support for healthcare billing (FEV - Factura Electrónica de Venta).

### Regulatory Framework
- **Resolución 2275 de 2023** - Primary RIPS regulation
- **Resolución 1884 de 2024** - Phased implementation schedule
- **Resolución 3374 de 2000** - Legacy flat file format (still accepted during transition)

### Implementation Timeline (Res. 1884/2024)

| Group | Description | Authentication | Go-Live |
|-------|-------------|----------------|---------|
| **Grupo 1** | High Complexity IPS | Feb 1, 2025 | Feb 1, 2025 |
| **Grupo 2** | Medium Complexity IPS | Apr 1, 2025 | Apr 1, 2025 |
| **Grupo 3** | Low Complexity IPS, Independent Professionals | Jun 1, 2025 | Jun 1, 2025 |

### Data Structures

#### New RIPS JSON Format (Res. 2275/2023)

The new format uses JSON as the data format, sent as support to the Electronic Sales Invoice (FEV):

```json
{
  "transaccion": {
    "codigoFacturador": "123456789",
    "numeroFactura": "FEV-001",
    "tipoNota": "NA",
    "fechaFactura": "2026-01-26"
  },
  "usuarios": [{
    "tipoDocumentoIdentificacion": "CC",
    "numDocumentoIdentificacion": "123456789",
    "tipoUsuario": "01",
    "fechaNacimiento": "1990-05-15",
    "codigoSexo": "M",
    "codPaisResidencia": "CO",
    "codMunicipioResidencia": "11001",
    "codZonaTerritorialResidencia": "U"
  }],
  "consulta": [{
    "codPrestador": "123456",
    "fechaInicioAtencion": "2026-01-26T10:00:00",
    "numAutorizacion": "AUTH001",
    "codConsulta": "890201",
    "modalidadGrupoServicioTecSal": "01",
    "grupoServicios": "01",
    "codServicio": "301",
    "finalidadTecnologiaSalud": "01",
    "causaMotivoAtencion": "01",
    "codDiagnosticoPrincipal": "J00",
    "codDiagnosticoRelacionado1": null,
    "tipoDiagnosticoPrincipal": "1",
    "vrServicio": 50000.00
  }],
  "procedimientos": [],
  "urgencias": [],
  "hospitalizacion": [],
  "recienNacidos": [],
  "medicamentos": [],
  "otrosServicios": []
}
```

#### Legacy Flat File Format (Res. 3374/2000)

Still supported during transition:

| File | Description | Required |
|------|-------------|----------|
| AF | Control data (master file) | Yes |
| US | Patient identification | Yes |
| AC | Medical consultations | If applicable |
| AP | Procedures | If applicable |
| AU | Emergency services | If applicable |
| AH | Hospitalization | If applicable |
| AN | Newborns | If applicable |
| AM | Medications | If applicable |
| AT | Other services | If applicable |

### FEV Sector Salud - XML Extensions

The electronic invoice (FEV) requires health sector specific fields in XML:

```xml
<ext:UBLExtensions>
  <ext:UBLExtension>
    <ext:ExtensionContent>
      <sts:DianExtensions>
        <sts:InvoiceControl>
          <!-- DIAN standard fields -->
        </sts:InvoiceControl>
        <sts:SectorSalud>
          <sts:CodigoPrestador>123456</sts:CodigoPrestador>
          <sts:ModalidadPago>04</sts:ModalidadPago>
          <sts:CoberturaOPlan>01</sts:CoberturaOPlan>
          <sts:NumeroContrato>CONTRACT-001</sts:NumeroContrato>
          <sts:Copago>5000.00</sts:Copago>
          <sts:CuotaModeradora>2500.00</sts:CuotaModeradora>
          <sts:FechaInicioPeriodo>2026-01-01</sts:FechaInicioPeriodo>
          <sts:FechaFinPeriodo>2026-01-31</sts:FechaFinPeriodo>
        </sts:SectorSalud>
      </sts:DianExtensions>
    </ext:ExtensionContent>
  </ext:UBLExtension>
</ext:UBLExtensions>
```

### Billing Scenarios (Tipos de Operación)

| Code | Scenario | Description |
|------|----------|-------------|
| SS-Recaudo | Recaudo | Copago/cuota moderadora collection (no RIPS) |
| SS-CUFE | Acreditación | Reference FEV for acreditación |
| SS-CUDE | Acreditación | Reference NC/ND for acreditación |
| SS-POS | Acreditación | Reference POS receipt |
| SS-SNum | Acreditación | Reference paper invoice |
| SS-Reporte | Reporte | EPS-collected moderation fees |
| SS-SinAporte | Sin Aporte | No patient contribution |

### Validation: MUV (Mecanismo Único de Validación)

MinSalud provides the MUV platform for RIPS validation:
- **URL**: To be published on MinSalud micrositio FEV-RIPS
- **Output**: CUV (Código Único de Validación)

### Implementation Effort
- **JSON RIPS Generator**: 2-3 weeks
- **FEV XML Integration**: 2-3 weeks (requires DIAN electronic invoicing)
- **MUV Integration**: 1-2 weeks
- **Testing & Certification**: 2-4 weeks
- **Total**: 8-12 weeks

---

## 3. MIPRES Integration

### Purpose
MIPRES (Mi Prescripción) is the platform for prescribing healthcare technologies not financed by the UPC (Unidad de Pago por Capitación), including non-PBS medications, procedures, medical devices, and nutritional support.

### API Documentation
- **Production**: `https://wsmipres.sispro.gov.co/WSMIPRESNOPBS/`
- **API Help**: `https://wsmipres.sispro.gov.co/WSMIPRESNOPBS/help`
- **Documentation PDF**: `https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/OT/Documentacion-web-services-V-3.1.pdf`

### Available Endpoints

#### Prescriptions
```
GET /api/Prescripcion/{nit}/{fecha}/{token}
    → All prescriptions for EPS/IPS on date

GET /api/PrescripcionPaciente/{nit}/{fecha}/{token}/{tipodoc}/{numdoc}
    → Prescriptions for specific patient

GET /api/PrescripcionXNumero/{nit}/{token}/{NoPresc}
    → Full prescription details by number

GET /api/NovedadesPrescripcion/{nit}/{fecha}/{token}
    → All prescription changes on date

POST /api/PrescripcionXMany/{nit}/{token}
    → Bulk prescription query
```

#### Professional Board (Junta Profesional)
```
GET /api/JuntaProfesional/{nit}/{token}/{numeroPrescripcion}
    → Board review status for prescription

GET /api/JuntaProfesionalXFecha/{nit}/{token}/{fecha}
    → Board reviews by date
```

#### Supply/Dispensation
```
PUT /api/Suministro/{nit}/{token}
    → Register supply to patient

PUT /api/AnularSuministro/{nit}/{token}
    → Cancel a supply record

GET /api/SuministroXFecha/{nit}/{token}/{fecha}
    → Supplies by date

GET /api/SuministroXPrescripcion/{nit}/{token}/{noPres}
    → Supplies by prescription number
```

#### Tutelas (Court Orders)
```
GET /api/Tutelas/{nit}/{fecha}/{token}
    → Tutelas for EPS/IPS on date

GET /api/TutelaXPaciente/{nit}/{fecha}/{token}/{tipodoc}/{numdoc}
    → Tutelas for specific patient
```

### Authentication
- **Method**: Token-based
- **Token Acquisition**: Through SISPRO platform registration
- **Required**: IPS NIT + Token per request

### Data Format
- **Format**: JSON (REST API)
- **Encoding**: UTF-8

### Implementation Effort
- **Read-only Integration** (prescriptions, tutelas): 1-2 weeks
- **Full Integration** (including supply registration): 3-4 weeks

---

## 4. HL7 FHIR / IHCE Integration

### Purpose
The IHCE (Interoperabilidad de Historia Clínica Electrónica) is Colombia's national health information exchange, implementing HL7 FHIR R4 for clinical data interoperability.

### Regulatory Framework
- **Ley 2015 de 2020** - Legal framework for interoperable EHR
- **Resolución 866 de 2021** - Technical requirements, data sets
- **Resolución 1888 de 2025** - RDA adoption, mandatory implementation

### Official Implementation Guide
- **URL**: `https://vulcano.ihcecol.gov.co/guia/`
- **Canonical URL**: `https://fhir.minsalud.gov.co/rda/`
- **Version**: 0.7.1 (as of Dec 2025)
- **Standard**: HL7 FHIR R4

### Core Colombia FHIR Guide
- **URL**: `https://co.fhir.guide/core/`

### RDA Document Types

The RDA (Resumen Digital de Atención en Salud) is the core clinical document:

| RDA Type | Description | Priority |
|----------|-------------|----------|
| RDA de Paciente | General patient encounter | Phase 1 |
| RDA de Hospitalización | Inpatient care | Phase 1 |
| RDA de Consulta Externa | Outpatient care | Phase 2 |
| RDA de Urgencias | Emergency care | Phase 2 |

### FHIR Resources Used

| Resource | Purpose |
|----------|---------|
| Bundle | Transaction container for RDA |
| Composition | RDA document structure |
| Patient | Patient demographics |
| Practitioner | Healthcare provider |
| Organization | IPS/EPS information |
| Encounter | Clinical encounter |
| Condition | Diagnoses (CIE-10/CIE-11) |
| Observation | Clinical observations |
| Procedure | Procedures (CUPS) |
| MedicationStatement | Medications |
| AllergyIntolerance | Allergies |

### Technical Requirements

#### API Gateway
- **URL**: To be published by MinSalud
- **Authentication**: API Key + OAuth2
- **Encryption**: TLS 1.3+, AES-256

#### RDA Bundle Structure
```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Composition",
        "status": "final",
        "type": {
          "coding": [{
            "system": "https://fhir.minsalud.gov.co/CodeSystem/RDA-Type",
            "code": "RDA-paciente"
          }]
        },
        "subject": { "reference": "Patient/123" },
        "encounter": { "reference": "Encounter/456" },
        "author": [{ "reference": "Practitioner/789" }],
        "section": [
          { /* Diagnósticos */ },
          { /* Procedimientos */ },
          { /* Medicamentos */ }
        ]
      }
    }
  ]
}
```

### Implementation Timeline
- **Deadline**: 6 months from October 15, 2025 (April 2026)
- **Phases**: Progressive implementation

### Implementation Effort
- **FHIR Server Setup**: 1-2 weeks
- **Profile Implementation**: 4-6 weeks
- **ETL Development**: 3-4 weeks
- **Testing & Certification**: 2-4 weeks
- **Total**: 10-16 weeks

---

## 5. SISPRO Platform Integration

### Purpose
SISPRO (Sistema Integral de Información de la Protección Social) is the central information platform consolidating all health system data.

### Components

#### RUAF (Registro Único de Afiliados)
- **URL**: `https://ruaf.sispro.gov.co/`
- **Purpose**: Consolidated affiliation database
- **Access**: Web portal + SOAP/REST services
- **Use Case**: Verify patient affiliation to all social security systems

#### REPS (Registro Especial de Prestadores)
- **URL**: `https://prestadores.minsalud.gov.co/`
- **Purpose**: IPS registration and validation
- **Required For**: All IPS operations

#### SISPRO Portal
- **URL**: `https://www.sispro.gov.co/`
- **URL**: `https://web.sispro.gov.co/`
- **Purpose**: Access to various health ministry applications

### Registration Requirements
1. Legal representative registration
2. Digital certificate (PKI)
3. IPS habilitación in REPS
4. SISPRO user credentials

### Implementation Effort
- **Portal Integration**: 1 week
- **RUAF Web Services**: 2 weeks

---

## 6. EPS Connector Strategy

### Major EPS in Colombia

| EPS | Market Share | Portal |
|-----|-------------|--------|
| Sura | ~20% | `https://www.epssura.com/` |
| Nueva EPS | ~18% | `https://www.nuevaeps.com.co/` |
| Sanitas | ~12% | `https://www.epssanitas.com/` |
| Compensar | ~8% | `https://corporativo.compensar.com/` |
| Famisanar | ~7% | `https://www.famisanar.com.co/` |
| Salud Total | ~6% | `https://saludtotal.com.co/` |
| Coomeva | ~5% | `https://eps.coomeva.com.co/` |
| SOS | ~4% | `https://www.sos.com.co/` |

### Integration Approach

#### Option A: Individual EPS Portals (Current State)
- Each EPS has its own authorization portal
- Manual process for service authorizations
- Varies significantly between EPS

#### Option B: Unified Through MIPRES (Non-PBS)
- All non-PBS authorizations through MIPRES
- Standardized API
- No individual EPS integration needed for non-PBS

#### Option C: EPS Web Services (Where Available)
- Some EPS provide web services for:
  - Authorization status queries
  - Claims submission
  - Payment reconciliation
- Requires individual agreements

### Recommended Strategy
1. **Phase 1**: Implement MIPRES for all non-PBS
2. **Phase 2**: Implement RIPS/FEV for standardized billing
3. **Phase 3**: Individual EPS integrations only where value-added services exist

### Common EPS Authorization Workflow
```
1. Patient arrives → Verify in BDUA/ADRES
2. Check coverage type (PBS/Non-PBS)
3. If PBS → Standard authorization
4. If Non-PBS → Prescribe via MIPRES
5. Generate RIPS + FEV for billing
6. Submit to EPS for payment
```

---

## 7. Terminology & Codification Systems

### Diagnostic Codes

#### CIE-10 (Current Standard)
- **Full Name**: Clasificación Internacional de Enfermedades, 10ª revisión
- **Format**: Alphanumeric (A00-Z99, 4 characters without dots)
- **Example**: J00 (Acute nasopharyngitis)

#### CIE-11 (Future Transition)
- **Resolución 1442 de 2024**: Mandatory CIE-11 adoption
- **Timeline**: Gradual transition starting 2025
- **Format**: Extended alphanumeric

### Procedure Codes

#### CUPS (Clasificación Única de Procedimientos en Salud)
- **Current**: Resolución 2641 de 2024 (CUPS 2025)
- **Previous**: Resolución 2336 de 2023 (CUPS 2024)
- **Validator**: `https://web.sispro.gov.co/WebPublico/Consultas/ConsultarDetalleReferenciaBasica.aspx?Code=CUPS`
- **Format**: 6-digit numeric codes
- **Structure**: 24 chapters in 2 sections

### Medication Codes

#### INVIMA Registry
- All medications must have INVIMA registration
- Unique code per medication presentation

#### ATC Classification
- WHO Anatomical Therapeutic Chemical Classification
- Used alongside INVIMA codes

### Reference Data Sources

| Terminology | Source | Update Frequency |
|-------------|--------|-----------------|
| CIE-10/11 | WHO/OMS | Annual |
| CUPS | MinSalud | Annual (December) |
| INVIMA | INVIMA | Continuous |
| EPS Codes | ADRES | Monthly |
| Municipality Codes | DANE | Periodic |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] ADRES/BDUA patient verification integration
- [ ] CUPS/CIE-10 terminology services
- [ ] Basic RIPS flat file generation (legacy format)

### Phase 2: Core Compliance (Weeks 5-12)
- [ ] RIPS JSON format implementation
- [ ] FEV sector salud XML integration
- [ ] MIPRES API integration (prescriptions + supplies)
- [ ] MUV validation integration

### Phase 3: Interoperability (Weeks 13-20)
- [ ] HL7 FHIR server setup
- [ ] Colombia Core FHIR profiles implementation
- [ ] RDA document generation
- [ ] IHCE platform integration

### Phase 4: Enhancement (Weeks 21-24)
- [ ] Advanced EPS portal integrations
- [ ] Real-time eligibility checking
- [ ] Automated glosas management
- [ ] Analytics & reporting

### Resource Requirements

| Role | FTE | Weeks |
|------|-----|-------|
| Backend Developer | 2 | 24 |
| Integration Specialist | 1 | 20 |
| FHIR/HL7 Specialist | 1 | 12 |
| QA Engineer | 1 | 16 |
| DevOps Engineer | 0.5 | 24 |

### Estimated Total Effort
- **Minimum Viable**: 12-16 weeks
- **Full Compliance**: 20-24 weeks
- **With FHIR**: 24-28 weeks

---

## Security & Compliance Requirements

### Data Protection
- **Ley 1581 de 2012**: Personal data protection
- **Habeas Data**: Patient data rights
- Health data classified as **sensitive data**

### Technical Security
- **TLS 1.3+**: All API communications
- **AES-256**: Data at rest encryption
- **OAuth2/API Keys**: Authentication
- **RBAC**: Role-based access control
- **Audit Logging**: All data access logged

### Compliance Certifications
- [ ] MinSalud registration for IHCE
- [ ] DIAN electronic invoicing authorization
- [ ] SISPRO platform registration
- [ ] Digital certificates (PKI)

---

## Appendix: Regulatory References

### Primary Legislation
| Reference | Title | Date |
|-----------|-------|------|
| Ley 2015 de 2020 | Historia Clínica Interoperable | 2020 |
| Ley 1581 de 2012 | Protección de Datos Personales | 2012 |
| Ley 1751 de 2015 | Ley Estatutaria de Salud | 2015 |
| Decreto 780 de 2016 | Decreto Único Sector Salud | 2016 |

### Ministry Resolutions
| Reference | Title | Date |
|-----------|-------|------|
| Resolución 2275 de 2023 | RIPS y FEV Sector Salud | Dec 2023 |
| Resolución 1884 de 2024 | Implementación Gradual RIPS | Sep 2024 |
| Resolución 1888 de 2025 | RDA e IHCE | Sep 2025 |
| Resolución 866 de 2021 | Interoperabilidad HCE | 2021 |
| Resolución 4622 de 2016 | Reporte BDUA | 2016 |
| Resolución 2641 de 2024 | CUPS 2025 | Dec 2024 |
| Resolución 1442 de 2024 | CIE-11 Adoption | 2024 |
| Resolución 3374 de 2000 | RIPS Legacy Format | 2000 |

### Technical Documentation
| Resource | URL |
|----------|-----|
| FHIR RDA Guide | `https://vulcano.ihcecol.gov.co/guia/` |
| MIPRES API | `https://wsmipres.sispro.gov.co/WSMIPRESNOPBS/help` |
| ADRES Portal | `https://www.adres.gov.co/eps/procesos/bdua` |
| SISPRO | `https://www.sispro.gov.co/` |
| CUPS Validator | `https://web.sispro.gov.co/WebPublico/Consultas/ConsultarDetalleReferenciaBasica.aspx?Code=CUPS` |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Integrations Architect | Initial specification |

---

*This document is part of the IPS-ERP technical documentation. For implementation questions, contact the development team.*
