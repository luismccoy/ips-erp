# IPS-ERP Content Strategy
## Thought Leadership for Colombian Home Healthcare Technology

**Created:** January 2026  
**Objective:** Position Luis Coy and IPS-ERP as the thought leader in Colombian home healthcare technology through educational content and authentic "building in public" storytelling.

---

## Table of Contents
1. [Validated Pain Points](#1-validated-pain-points)
2. [Content Gap Analysis](#2-content-gap-analysis)
3. [Keyword Opportunities](#3-keyword-opportunities)
4. [12-Month Content Calendar](#4-12-month-content-calendar)
5. [Distribution Channel Strategy](#5-distribution-channel-strategy)
6. [Building in Public Playbook](#6-building-in-public-playbook)
7. [Metrics & KPIs](#7-metrics--kpis)

---

## 1. Validated Pain Points

### 🔥 Critical Pain Point #1: Glosas (Claim Denials)
**Severity: CRITICAL | Frequency: Daily**

**Research Evidence:**
- Contraloría report: EPS glosas reach **62-99%** for some billing lines (ConsultorSalud, Aug 2024)
- IPS warning of collapse: EPS intervenidas deben **$2.2 billones**, 87% is overdue (ConsultorSalud, Feb 2025)
- Manual glosa processes take weeks; errors compound
- Nueva EPS suspended payments to **144 IPS** due to billing disputes (Sept 2024)

**What IPS Owners Say:**
- "Las glosas nos están quebrando" (common sentiment)
- "No hay forma de saber si vamos a cobrar hasta meses después"
- "La auditoría interna es imposible con Excel"

**IPS-ERP Angle:** AI-powered glosa defense (`generateGlosaDefense`) and pre-submission RIPS validation

---

### 🔥 Critical Pain Point #2: RIPS Compliance & FEV-RIPS Integration
**Severity: HIGH | Frequency: Weekly**

**Research Evidence:**
- Resolución 2275 de 2023 mandates electronic RIPS
- MinSalud implementing FEV-RIPS with phased rollout:
  - Group 1 (alta complejidad): Oct 2024
  - Group 2: Jan 2025  
  - Group 3 (includes domiciliarias): April 2025
- Common errors: CUPS/CIE-10 mismatches, XML structure failures, validation rejections
- Medilink published a full "catálogo de errores" showing how complex validation is

**What IPS Owners Say:**
- "Cada vez que MinSalud actualiza el validador, todo se rompe"
- "Necesitamos 2 sistemas: uno para historia clínica, otro para RIPS"
- "Los rechazos del validador no explican nada"

**IPS-ERP Angle:** `validateRIPS` AI feature, automatic JSON generation, error explanations in plain Spanish

---

### 🔥 Critical Pain Point #3: Nurse Scheduling & Shift Management
**Severity: HIGH | Frequency: Daily**

**Research Evidence:**
- Clonkapp.com: "La programación de turnos del personal médico suele ser una actividad caótica"
- Most IPS still use Excel or manual methods
- No Colombian-specific solutions integrate scheduling with billing and patient records
- Compliance with labor laws (rest periods, overtime) is manual and error-prone

**What IPS Owners Say:**
- "Los médicos jefes pierden horas haciendo turnos en Excel"
- "Cuando una enfermera se enferma, es caos reorganizar todo"
- "No sé cuántas horas extra estamos pagando realmente"

**IPS-ERP Angle:** `generateRoster` AI scheduling with labor law compliance, integrated with billing

---

### 🔥 Critical Pain Point #4: Resolución 3100 Habilitación Compliance
**Severity: MEDIUM | Frequency: Annual/Ongoing**

**Research Evidence:**
- Resolución 3100 de 2019 (modified by Res 544 de 2023) governs IPS licensing
- Self-evaluation (autoevaluación) required for REPS registration
- Domiciliary services have specific requirements
- Training courses sell for $200-500 showing market demand (dominahabilitacion.com)

**What IPS Owners Say:**
- "¿Qué documentos necesito exactamente para habilitación domiciliaria?"
- "La autoevaluación es un laberinto burocrático"
- "Tememos perder la habilitación por errores administrativos"

**IPS-ERP Angle:** Compliance dashboard, document checklist, audit preparation tools

---

### 🔥 Critical Pain Point #5: EPS Payment Crisis & Cash Flow
**Severity: CRITICAL | Frequency: Constant**

**Research Evidence:**
- Total EPS debt: **$32 billones** (MinSalud, 2025)
- Nueva EPS facturas sin auditar: **$13.17 billones** (Contraloría, 2025)
- 2024: 1,831 IPS sede closures, 380 complete IPS closures (El Tiempo)
- "Crisis silenciosa en la red hospitalaria" - headline trend

**What IPS Owners Say:**
- "Las EPS no pagan, pero tenemos que pagar nómina"
- "Anticipos no compensan la cartera vencida"
- "Necesito visibilidad de mi flujo de caja real"

**IPS-ERP Angle:** Financial dashboards, cartera aging reports, cash flow projections

---

## 2. Content Gap Analysis

### What Educational Content EXISTS:
| Topic | Sources | Quality |
|-------|---------|---------|
| RIPS technical documentation | MinSalud PDFs, SISPRO | Dense, hard to understand |
| Glosas legal framework | ConsultorSalud, Actualícese | News-focused, not actionable |
| Habilitación requirements | Official resolutions | Bureaucratic language |
| Software comparisons | Capterra, Guía TIC | Generic, no Colombia context |

### What Content is MISSING (Opportunities):
| Gap | Opportunity | Difficulty |
|-----|-------------|------------|
| **Practical RIPS tutorials** | Step-by-step video guides in plain Spanish | Medium |
| **Glosa prevention checklists** | Downloadable templates with automation tips | Low |
| **Home healthcare specific guides** | Res 3100 for domiciliarias explained | Medium |
| **AI in IPS operations** | Demystifying AI for healthcare admins | Low |
| **Financial survival guides** | How to manage cash flow during EPS crisis | Medium |
| **Founder journey content** | No Colombian healthtech "build in public" | Low |
| **Comparison guides** | Honest software comparisons for IPS | Medium |
| **Integration tutorials** | How to connect different systems | High |

### ConsultorSalud Analysis:
- **Strength:** News coverage, regulatory updates, large audience
- **Gap:** No practical how-to content, no software focus, no startup perspective
- **Opportunity:** Partner for distribution, not compete on news

---

## 3. Keyword Opportunities

### High-Intent Keywords (Bottom of Funnel)
| Keyword | Search Intent | Competition | IPS-ERP Fit |
|---------|---------------|-------------|-------------|
| `software para IPS Colombia` | Buying | HIGH | ⭐⭐⭐⭐⭐ |
| `software IPS domiciliaria` | Buying | LOW | ⭐⭐⭐⭐⭐ |
| `historia clínica electrónica IPS` | Buying | HIGH | ⭐⭐⭐⭐ |
| `facturación electrónica salud Colombia` | Buying | MEDIUM | ⭐⭐⭐⭐ |

### Problem-Aware Keywords (Middle of Funnel)
| Keyword | Search Intent | Competition | IPS-ERP Fit |
|---------|---------------|-------------|-------------|
| `cómo reducir glosas EPS` | Solution-seeking | LOW | ⭐⭐⭐⭐⭐ |
| `errores RIPS validador` | Problem-solving | LOW | ⭐⭐⭐⭐⭐ |
| `programación turnos enfermería` | Solution-seeking | LOW | ⭐⭐⭐⭐⭐ |
| `FEV RIPS Colombia tutorial` | Learning | LOW | ⭐⭐⭐⭐ |
| `Resolución 3100 requisitos` | Learning | MEDIUM | ⭐⭐⭐⭐ |

### Awareness Keywords (Top of Funnel)
| Keyword | Search Intent | Competition | IPS-ERP Fit |
|---------|---------------|-------------|-------------|
| `crisis EPS Colombia` | News | HIGH | ⭐⭐⭐ |
| `transformación digital salud Colombia` | Learning | MEDIUM | ⭐⭐⭐⭐ |
| `inteligencia artificial salud Colombia` | Learning | MEDIUM | ⭐⭐⭐⭐ |
| `hospitalización domiciliaria Colombia` | Learning | LOW | ⭐⭐⭐⭐⭐ |

### Long-Tail Opportunities (Low Competition, High Intent)
- `software para IPS de atención domiciliaria`
- `cómo habilitar una IPS domiciliaria en Colombia`
- `validador RIPS errores comunes solución`
- `defensa de glosas automatizada`
- `programación turnos enfermería domiciliaria`

---

## 4. 12-Month Content Calendar

### Content Mix Strategy
- **40%** Educational (how-to guides, tutorials)
- **30%** Thought leadership (opinion, trends, analysis)
- **20%** Building in public (journey updates, learnings)
- **10%** Product-focused (features, case studies)

---

### Month 1-3: Foundation (Awareness)

#### Content Piece #1: Blog Post
**Title:** "La Guía Definitiva de RIPS 2025: Todo lo que tu IPS Necesita Saber"
- **Format:** Long-form blog (3000+ words)
- **Keywords:** RIPS Colombia, FEV RIPS, validador RIPS
- **Angle:** Comprehensive, plain-Spanish explanation
- **CTA:** Download RIPS checklist PDF

#### Content Piece #2: LinkedIn Article
**Title:** "Por qué las Glosas Están Destruyendo a las IPS Colombianas (y Qué Hacer al Respecto)"
- **Format:** LinkedIn article + carousel
- **Keywords:** glosas EPS, reducir glosas
- **Angle:** Problem awareness with actionable tips
- **CTA:** Join waiting list for AI glosa defense tool

#### Content Piece #3: YouTube Video
**Title:** "Resolución 3100 Explicada: Habilitación para IPS Domiciliarias en 15 Minutos"
- **Format:** Screencast tutorial
- **Keywords:** Resolución 3100, habilitación IPS domiciliaria
- **Angle:** Visual walkthrough of requirements
- **CTA:** Subscribe for more IPS tutorials

---

### Month 4-6: Authority Building (Consideration)

#### Content Piece #4: Blog Post
**Title:** "Cómo Programar Turnos de Enfermería Sin Volverse Loco: Guía Práctica"
- **Format:** Blog + downloadable Excel template
- **Keywords:** programación turnos enfermería, horarios enfermería
- **Angle:** Start with Excel, show path to automation
- **CTA:** See how AI can do this automatically

#### Content Piece #5: LinkedIn Series
**Title:** "Construyendo IPS-ERP en Público: Semana [X]"
- **Format:** Weekly LinkedIn post series
- **Keywords:** startup Colombia, healthtech
- **Angle:** Transparent updates on features, challenges, wins
- **CTA:** Follow for the journey

#### Content Piece #6: YouTube Tutorial
**Title:** "Los 10 Errores de RIPS Más Comunes (y Cómo Evitarlos)"
- **Format:** Screen recording with real examples
- **Keywords:** errores RIPS, validador RIPS errores
- **Angle:** Practical problem-solving
- **CTA:** Try our RIPS validator free

---

### Month 7-9: Differentiation (Decision)

#### Content Piece #7: Case Study
**Title:** "Cómo [IPS Partner] Redujo Glosas en 40% con Validación Automática"
- **Format:** Blog + video testimonial
- **Keywords:** reducir glosas, software IPS
- **Angle:** Social proof with real numbers
- **CTA:** Book a demo

#### Content Piece #8: Guide
**Title:** "La Supervivencia Financiera de tu IPS: Manual para la Crisis de las EPS"
- **Format:** Downloadable PDF guide (gated)
- **Keywords:** crisis EPS, flujo de caja IPS
- **Angle:** Timely, empathetic, actionable
- **CTA:** Download guide (email capture)

#### Content Piece #9: LinkedIn Live
**Title:** "AMA: Pregúntale a un Fundador de HealthTech Colombiano"
- **Format:** Live Q&A session
- **Keywords:** healthtech Colombia, emprendimiento salud
- **Angle:** Personal connection, thought leadership
- **CTA:** Follow for next live

---

### Month 10-12: Acceleration (Conversion)

#### Content Piece #10: Comparison Post
**Title:** "Software para IPS en Colombia 2025: Comparativa Honesta"
- **Format:** Blog with comparison table
- **Keywords:** software IPS Colombia, mejor software IPS
- **Angle:** Transparent, acknowledges competitors' strengths
- **CTA:** See where IPS-ERP fits for domiciliarias

#### Content Piece #11: YouTube Deep Dive
**Title:** "IA en Salud Colombiana: Del Hype a la Realidad"
- **Format:** Documentary-style video
- **Keywords:** inteligencia artificial salud Colombia
- **Angle:** Balanced, educational, forward-looking
- **CTA:** See AI features in IPS-ERP

#### Content Piece #12: Year in Review
**Title:** "Un Año Construyendo IPS-ERP: Lecciones, Fracasos y Victorias"
- **Format:** LinkedIn article + video
- **Keywords:** startup Colombia, building in public
- **Angle:** Vulnerable, authentic retrospective
- **CTA:** Join us for year 2

---

## 5. Distribution Channel Strategy

### 🥇 Primary Channel: LinkedIn
**Why:** 
- CEOs and gerentes use LinkedIn more than any other platform
- B2B decision-makers are active
- Long-form content performs well
- Comments drive algorithmic reach

**Strategy:**
| Day | Content Type | Time |
|-----|--------------|------|
| Monday | Industry insight/opinion | 8am COT |
| Wednesday | Educational tip/thread | 12pm COT |
| Friday | Building in public update | 6pm COT |

**Tactics:**
1. Comment on ConsultorSalud, ACEMI, and ministry posts daily
2. Engage with IPS gerentes' content before posting
3. Use carousel posts for complex topics
4. Tag relevant people/organizations (not spam)
5. Respond to every comment within 2 hours

**Profile Optimization:**
- Headline: "Construyendo el futuro del software para IPS domiciliarias | Founder @IPS-ERP | AWS + AI"
- Banner: IPS-ERP screenshot with tagline
- Featured: Top 3 posts + demo link

---

### 🥈 Secondary Channel: YouTube
**Why:**
- No quality Colombian IPS tutorial content exists
- Video builds trust faster than text
- SEO value (owned by Google)
- Evergreen content potential

**Content Types:**
1. **Tutorials** (10-15 min): RIPS, habilitación, glosas
2. **Quick tips** (2-3 min): Shorts format
3. **Product demos** (5-10 min): Feature walkthroughs

**Posting Cadence:** 2 videos/month minimum

**SEO Strategy:**
- Titles in Spanish with keywords
- Detailed descriptions with timestamps
- Custom thumbnails with text
- End screens linking to demo

---

### 🥉 Tertiary Channel: Blog (SEO)
**Why:**
- Own the content and traffic
- Long-term SEO value
- Gated content for leads

**Technical Setup:**
- Host on IPS-ERP domain (ips-erp.com/blog)
- Use schema markup for healthcare content
- Internal linking strategy

**Posting Cadence:** 1 long-form post/month

---

### 🤝 Partnership Channel: ConsultorSalud
**Why:**
- Largest healthcare media in Colombia
- 100k+ newsletter subscribers
- Trusted by IPS decision-makers

**Partnership Approaches:**
1. **Guest posts:** Offer exclusive technical guides
2. **Sponsored content:** Pay for featured articles
3. **Webinar collaboration:** Joint educational events
4. **Data sharing:** Provide insights they can publish

**Outreach Template:**
```
Hola equipo ConsultorSalud,

Soy Luis Coy, founder de IPS-ERP, una startup colombiana enfocada 
en software para IPS domiciliarias.

Noto que su audiencia pregunta constantemente sobre [RIPS/glosas/etc]. 
Quisiera proponer crear una guía práctica gratuita que podríamos 
co-publicar.

¿Les interesa una llamada de 15 minutos?
```

---

### 📱 Supplementary: Twitter/X
**Why:** Tech/startup community, faster feedback loop

**Strategy:** Mirror LinkedIn content, engage with LATAM healthtech founders

---

## 6. Building in Public Playbook

### Core Philosophy
> "Share the journey, not just the destination. Your struggles are someone else's education."

### What to Share

#### ✅ DO Share:
| Category | Examples |
|----------|----------|
| **Metrics** | "Esta semana: 12 demos, 3 conversiones, 1 churn" |
| **Learnings** | "Pensé que X funcionaría. Estaba equivocado. Aquí está por qué..." |
| **Decisions** | "Estamos pivotando de [A] a [B]. La razón..." |
| **Wins** | "¡Primera IPS pagando! Aquí está la historia..." |
| **Failures** | "Este feature fracasó. Aprendimos que..." |
| **Process** | "Así construimos [feature]. Tiempo real: 3 semanas" |
| **Customer stories** | (With permission) "Esta IPS tenía [problema]..." |

#### ❌ DON'T Share:
- Exact revenue numbers (unless strategic)
- Customer names without permission
- Security vulnerabilities
- Internal conflicts
- Unvalidated claims

### Content Frameworks

#### Framework 1: The Learning Loop
```
🔍 Problema que encontramos
📊 Lo que intentamos
❌ Por qué no funcionó
✅ Lo que sí funcionó
💡 Lección para otros
```

#### Framework 2: The Build Update
```
🛠️ Esta semana construimos: [feature]
⏱️ Tiempo real: [X horas/días]
🧠 Decisión más difícil: [trade-off]
📈 Impacto esperado: [metric]
🔜 Próximo paso: [what's next]
```

#### Framework 3: The Vulnerable Win
```
🎉 Celebrando: [win]
😅 Lo que no cuento: [struggle behind it]
🙏 Gracias a: [people who helped]
📝 Si pudiera hacerlo de nuevo: [would do differently]
```

### Authenticity Guidelines

1. **Be specific:** "Hoy hablé con 3 gerentes de IPS" > "Hablé con clientes"
2. **Show work:** Screenshots, code snippets, Figma designs
3. **Acknowledge uncertainty:** "No sé si esto funcionará, pero..."
4. **Credit others:** Tag collaborators, mention inspirations
5. **Stay consistent:** Post even when things are hard
6. **Respond to everyone:** Building in public = building community

### Colombian Healthcare Audience Resonance

**What resonates:**
- Frustration with EPS system (shared enemy)
- Pride in Colombian healthcare innovation
- Practical solutions over theory
- Local context and examples
- Respect for healthcare workers
- Awareness of regulatory complexity

**Tone:**
- Professional but approachable
- Empathetic to IPS struggles
- Technically competent but not arrogant
- Hopeful despite systemic challenges

### Sample "Building in Public" Posts

#### Post 1: The Struggle
```
🏥 Semana 14 de construir IPS-ERP

La verdad: Esta semana fue dura.

Tres IPS nos dijeron que les encanta el producto pero 
"no hay presupuesto hasta que las EPS paguen."

La crisis del sistema de salud no es solo un titular.
Es un gerente de IPS que no sabe si puede pagar nómina.
Es una enfermera que no sabe si tendrá trabajo el mes que viene.

No voy a fingir que tenemos todas las respuestas.
Pero sí sé esto: la tecnología puede ayudar a sobrevivir la crisis.

Una IPS nos contó que validar RIPS manualmente le toma 20 horas/mes.
Con nuestra automatización: 2 horas.
18 horas que pueden dedicar a lo que importa: los pacientes.

Seguimos construyendo. 🔨

#HealthTech #IPS #Colombia #BuildingInPublic
```

#### Post 2: The Win
```
🎉 ¡Primera IPS de atención domiciliaria usando IPS-ERP en producción!

📍 Bogotá
👩‍⚕️ 12 enfermeras
🏠 ~200 pacientes/mes

Lo que no cuento en los pitch decks:
- Nos tomó 4 meses cerrar este cliente
- Hicimos 3 demos antes de que dijeran sí
- Personalizamos 2 features específicamente para ellos
- La implementación tuvo 2 bugs críticos que arreglamos en fin de semana

Pero hoy, su gerente me escribió:
"Por primera vez, sé exactamente cuánto me debe cada EPS."

Ese mensaje vale más que cualquier métrica de vanidad.

A las 200+ IPS domiciliarias en Colombia: 
Estamos construyendo esto para ustedes. 

¿Qué problema les quita el sueño?

#HealthTech #Startups #Colombia
```

---

## 7. Metrics & KPIs

### Content Performance Metrics

| Metric | Target (Month 1-3) | Target (Month 4-6) | Target (Month 7-12) |
|--------|-------------------|-------------------|---------------------|
| LinkedIn followers | +200 | +500 | +1,500 |
| LinkedIn post impressions | 5K/month | 15K/month | 50K/month |
| YouTube subscribers | 100 | 300 | 1,000 |
| YouTube views | 1K/month | 5K/month | 15K/month |
| Blog sessions | 500/month | 2K/month | 10K/month |
| Email list signups | 50 | 200 | 1,000 |

### Business Impact Metrics

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| Demo requests from content | 5/month | UTM tags, "how did you hear about us" |
| Mentions in industry media | 1/quarter | Google Alerts, social listening |
| ConsultorSalud partnership | Q2 | Relationship milestone |
| Inbound leads (content-attributed) | 20% of total | CRM attribution |

### Engagement Quality Metrics

| Metric | What to Track |
|--------|---------------|
| Comment quality | Are IPS owners engaging? |
| DM conversations | Are decision-makers reaching out? |
| Content saves | Are people bookmarking guides? |
| Shares | Is content being forwarded to teams? |

---

## Appendix: Quick Reference

### Posting Schedule
| Day | Platform | Content Type |
|-----|----------|--------------|
| Monday | LinkedIn | Industry insight |
| Tuesday | - | Engage/comment |
| Wednesday | LinkedIn | Educational |
| Thursday | YouTube (bi-weekly) | Tutorial |
| Friday | LinkedIn | Building in public |
| Weekend | - | Rest/plan |

### Content Pillars
1. **RIPS & Billing** - Technical how-tos
2. **Glosas & Cash Flow** - Survival strategies
3. **Operations & Scheduling** - Efficiency tips
4. **Regulatory Compliance** - Res 3100, updates
5. **AI & Innovation** - Future of healthcare
6. **Founder Journey** - Building in public

### Key Hashtags (LinkedIn)
- #HealthTech
- #SaludColombia
- #IPS
- #TransformaciónDigital
- #StartupsColombia
- #BuildingInPublic
- #AtenciónDomiciliaria

---

*This strategy should be reviewed and updated quarterly based on performance data and market changes.*
