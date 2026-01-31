# IPS-ERP UI/UX Design Research & Recommendations

> **Last Updated:** January 30, 2026  
> **Product:** IPS-ERP (Home Healthcare Management SaaS)  
> **Target Market:** Colombian IPS Organizations  
> **Stack:** React + TailwindCSS  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Landing Page Design Patterns](#landing-page-design-patterns)
3. [Dashboard Module Designs](#dashboard-module-designs)
4. [Design System Recommendations](#design-system-recommendations)
5. [Component Library Patterns](#component-library-patterns)
6. [Accessibility Guidelines](#accessibility-guidelines)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Key Insights from Market Research

**Healthcare SaaS Leaders Analyzed:**
- **AlayaCare** - "Transforming home-based care agencies for growth"
- **Homecare Homebase (HCHB)** - "Software Designed By Nurses for Nurses"
- **Axxess** - "The Future of Healthcare is in the Home"
- **CareAcademy** - "Transform caregiver education"

**B2B SaaS Design Leaders:**
- **Linear** - "Plan and build products" (minimalist, speed-focused)
- **Notion** - Workspace flexibility (blocked by Cloudflare, but well-known patterns)

### Core Design Principles for IPS-ERP

| Principle | Application |
|-----------|-------------|
| **Trust First** | Healthcare requires credibility badges, compliance indicators, testimonials |
| **Role-Based UX** | Distinct experiences for Admins, Nurses, Families |
| **Mobile-First** | Nurses work in the field; families check from phones |
| **Clarity Over Cleverness** | Medical data must be instantly understandable |
| **Speed & Reliability** | Linear-style performance obsession |

---

## Landing Page Design Patterns

### Variation 1: "Trust & Authority" (HCHB-Inspired)

**Best For:** Conservative Colombian healthcare market, emphasizing compliance and expertise.

#### Hero Section Layout
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]                    [Soluciones] [Precios] [CTA]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Software de Salud Domiciliaria                          │
│   Diseñado por Profesionales de la Salud                   │
│                                                            │
│   [Gestione visitas, facturación y cumplimiento           │
│    normativo en una sola plataforma]                       │
│                                                            │
│   [🎬 Ver Demo]  [📞 Solicitar Llamada]                   │
│                                                            │
│   ✓ Cumple Res. 3100   ✓ RIPS Automático   ✓ Soporte 24/7 │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  "Confiado por 50+ IPS en Colombia"  [Logo] [Logo] [Logo]  │
└────────────────────────────────────────────────────────────┘
```

**Value Proposition Presentation:**
```jsx
// Hero component structure
<section className="relative bg-gradient-to-br from-blue-900 to-blue-700">
  <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28">
    {/* Badge de credibilidad */}
    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
      <CheckCircle className="w-5 h-5 text-green-400" />
      <span className="text-white text-sm font-medium">
        #1 en Software de Salud Domiciliaria en Colombia
      </span>
    </div>
    
    <h1 className="text-4xl lg:text-6xl font-bold text-white max-w-4xl">
      Gestión de Atención Domiciliaria
      <span className="text-blue-300"> Simplificada</span>
    </h1>
    
    <p className="mt-6 text-xl text-blue-100 max-w-2xl">
      Desde la programación de visitas hasta la facturación RIPS,
      todo en una plataforma diseñada para IPS colombianas.
    </p>
    
    {/* CTA Group */}
    <div className="mt-10 flex flex-col sm:flex-row gap-4">
      <Button variant="primary" size="lg">
        <Play className="w-5 h-5 mr-2" />
        Ver Demo en Vivo
      </Button>
      <Button variant="secondary" size="lg">
        Solicitar Prueba Gratuita
      </Button>
    </div>
    
    {/* Trust Badges */}
    <div className="mt-12 flex flex-wrap gap-6 text-white/80">
      <TrustBadge icon={Shield} text="Cumple Res. 3100/2019" />
      <TrustBadge icon={FileCheck} text="RIPS Automático" />
      <TrustBadge icon={Clock} text="Soporte 24/7" />
    </div>
  </div>
</section>
```

**Pros:**
- Builds instant credibility with healthcare professionals
- Colombian compliance badges differentiate from foreign competitors
- "Designed by healthcare professionals" messaging resonates (HCHB strategy)

**Cons:**
- May feel traditional; less appeal to tech-forward IPS
- Heavier visual weight

---

### Variation 2: "Modern Minimalist" (Linear-Inspired)

**Best For:** Tech-savvy healthcare administrators, emphasizing speed and efficiency.

#### Hero Section Layout
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]                              [Login] [Empezar →]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              La forma moderna de gestionar                 │
│                 tu IPS domiciliaria                        │
│                                                            │
│         Simplifica visitas, pacientes y reportes.          │
│           Construido para equipos que valoran su tiempo.   │
│                                                            │
│                  [Comenzar gratis →]                       │
│                                                            │
│         ↓ Usado por equipos de salud en toda Colombia      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                [Animated Product Screenshot]               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Value Proposition Presentation:**
```jsx
<section className="bg-[#0A0A0B] min-h-screen flex flex-col">
  <nav className="flex justify-between items-center px-6 py-4">
    <Logo className="h-8" />
    <div className="flex items-center gap-4">
      <Link href="/login" className="text-gray-400 hover:text-white">
        Iniciar sesión
      </Link>
      <Button variant="primary" size="sm">
        Empezar →
      </Button>
    </div>
  </nav>
  
  <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
    <motion.h1 
      className="text-5xl lg:text-7xl font-semibold text-white tracking-tight"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      La forma moderna de gestionar
      <br />
      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        tu IPS domiciliaria
      </span>
    </motion.h1>
    
    <p className="mt-6 text-xl text-gray-400 max-w-xl">
      Simplifica visitas, pacientes y reportes.
      Construido para equipos que valoran su tiempo.
    </p>
    
    <Button className="mt-10" variant="primary" size="lg">
      Comenzar gratis →
    </Button>
    
    <p className="mt-8 text-sm text-gray-500">
      ↓ Usado por equipos de salud en toda Colombia
    </p>
  </main>
  
  {/* Product Screenshot with glow effect */}
  <div className="relative px-4 pb-20">
    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent blur-3xl" />
    <img 
      src="/dashboard-preview.png" 
      alt="IPS-ERP Dashboard"
      className="relative mx-auto rounded-xl border border-white/10 shadow-2xl"
    />
  </div>
</section>
```

**Pros:**
- Stands out dramatically from traditional healthcare software
- Communicates innovation and modernity
- Attracts younger, tech-forward administrators

**Cons:**
- May feel unfamiliar to traditional IPS decision-makers
- Less emphasis on compliance messaging

---

### Variation 3: "Solution-Focused Cards" (Axxess/AlayaCare-Inspired)

**Best For:** IPS with diverse service lines (nursing, therapy, palliative care).

#### Hero Section Layout
```
┌────────────────────────────────────────────────────────────┐
│  El Futuro del Cuidado está en el Hogar                    │
│                                                            │
│  IPS-ERP potencia la atención domiciliaria con            │
│  tecnología para mejorar vidas                            │
│                                                            │
│  [Ver Soluciones]  [Agendar Demo]                          │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ 🏠 Salud     │ │ 💊 Terapias  │ │ 🤲 Cuidados  │        │
│ │ Domiciliaria │ │ Domiciliarias│ │ Paliativos   │        │
│ │              │ │              │ │              │        │
│ │ Gestiona     │ │ Programa     │ │ Mantén a los │        │
│ │ enfermería,  │ │ fisioterapia,│ │ equipos      │        │
│ │ seguimiento  │ │ ocupacional  │ │ conectados   │        │
│ │ y reportes   │ │ y más        │ │ y enfocados  │        │
│ │              │ │              │ │              │        │
│ │ [Saber más →]│ │ [Saber más →]│ │ [Saber más →]│        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────────────────────────────────────────┘
```

**Value Proposition Presentation:**
```jsx
<section className="bg-white">
  {/* Hero */}
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
      El Futuro del Cuidado está en el Hogar
    </h1>
    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
      IPS-ERP potencia la atención domiciliaria con tecnología para mejorar vidas
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <Button variant="primary">Ver Soluciones</Button>
      <Button variant="outline">Agendar Demo</Button>
    </div>
  </div>
  
  {/* Solution Cards */}
  <div className="max-w-7xl mx-auto px-4 pb-20">
    <div className="grid md:grid-cols-3 gap-6">
      {solutions.map((solution) => (
        <Card 
          key={solution.id}
          className="group hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <solution.icon className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>{solution.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{solution.description}</p>
          </CardContent>
          <CardFooter>
            <Link 
              href={solution.href}
              className="text-blue-600 font-medium inline-flex items-center group-hover:gap-2 transition-all"
            >
              Saber más 
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
</section>
```

**Pros:**
- Immediately shows breadth of capabilities
- Self-qualifying (visitors click what's relevant)
- Scales well as product expands

**Cons:**
- Less focused initial message
- Requires strong sub-pages for each solution

---

### Variation 4: "Social Proof Heavy" (CareAcademy-Inspired)

**Best For:** New market entry, building trust through numbers and testimonials.

#### Hero Section Layout
```
┌────────────────────────────────────────────────────────────┐
│  Transforme la Gestión de su IPS Domiciliaria              │
│                                                            │
│  Capacitación más inteligente. Cumplimiento simplificado.  │
│  Para organizaciones de cuidado post-agudo.                │
│                                                            │
│  [Comenzar]                                                 │
├────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ 50+    │  │ 95%    │  │ 10K+   │  │ 4.8★   │           │
│  │ IPS    │  │ Ahorro │  │ Visitas│  │ Rating │           │
│  │ Confían│  │ Tiempo │  │ Mes    │  │ Clientes│          │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
├────────────────────────────────────────────────────────────┤
│  "IPS-ERP transformó cómo gestionamos..."                  │
│  — Dra. María Rodríguez, IPS Cuidar Colombia              │
└────────────────────────────────────────────────────────────┘
```

**Stats Component:**
```jsx
const stats = [
  { value: '50+', label: 'IPS Confían en Nosotros', icon: Building2 },
  { value: '95%', label: 'Ahorro en Tiempo Administrativo', icon: Clock },
  { value: '10K+', label: 'Visitas Gestionadas/Mes', icon: Activity },
  { value: '4.8★', label: 'Calificación de Clientes', icon: Star },
];

<div className="bg-gray-50 py-12">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <stat.icon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-gray-900">
            {stat.value}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

### CTA Strategies Comparison

| Strategy | Example | Best For |
|----------|---------|----------|
| **Dual CTA** | "Ver Demo" + "Prueba Gratis" | Capturing both high-intent and browsing visitors |
| **Single Strong CTA** | "Comenzar Ahora →" | Clear conversion focus |
| **Value-First CTA** | "Ver cómo funciona" | Educational, longer sales cycle |
| **Demo-Request CTA** | "Agendar Demo Personalizada" | Enterprise/high-touch sales |

**Recommended for IPS-ERP:**
```jsx
// Primary: Demo (high intent) | Secondary: Self-serve trial
<div className="flex gap-4">
  <Button variant="primary" size="lg">
    <Calendar className="w-5 h-5 mr-2" />
    Agendar Demo
  </Button>
  <Button variant="outline" size="lg">
    Probar Gratis 14 Días
  </Button>
</div>
```

---

### Trust Signals for Healthcare SaaS

#### Colombian-Specific Compliance Badges
```jsx
const ComplianceBadges = () => (
  <div className="flex flex-wrap gap-4 justify-center">
    <Badge variant="compliance">
      <Shield className="w-4 h-4" />
      Resolución 3100/2019
    </Badge>
    <Badge variant="compliance">
      <FileText className="w-4 h-4" />
      RIPS Compatible
    </Badge>
    <Badge variant="compliance">
      <Lock className="w-4 h-4" />
      Habeas Data (Ley 1581)
    </Badge>
    <Badge variant="compliance">
      <Server className="w-4 h-4" />
      Datos en Colombia
    </Badge>
  </div>
);
```

#### Client Logos Section
```jsx
<section className="py-12 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    <p className="text-center text-sm text-gray-500 mb-8">
      Confiado por IPS líderes en Colombia
    </p>
    <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
      {clientLogos.map((logo) => (
        <img 
          key={logo.name}
          src={logo.src}
          alt={logo.name}
          className="h-8 lg:h-10 object-contain"
        />
      ))}
    </div>
  </div>
</section>
```

#### Testimonial Card
```jsx
<Card className="max-w-2xl mx-auto">
  <CardContent className="pt-6">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <blockquote className="text-lg text-gray-700 italic">
      "IPS-ERP redujo nuestro tiempo de facturación en un 70%. 
      El soporte entiende perfectamente las necesidades de las IPS colombianas."
    </blockquote>
    <div className="mt-6 flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/testimonials/maria.jpg" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">Dra. María Rodríguez</p>
        <p className="text-sm text-gray-500">
          Directora Médica, IPS Cuidar Colombia
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Dashboard Module Designs

### Admin Portal Layout Options

#### Option A: "Command Center" (Full-Width Data-Dense)

**Best For:** Power users managing multiple locations, heavy analytics users.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [☰] IPS-ERP              [🔍 Buscar...]    [🔔] [👤 Admin] [⚙️]        │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│ 📊 Panel│  ┌─────────────────────────────────────────────────────────┐  │
│         │  │ Visitas Hoy: 47  │ Pendientes: 12  │ Alertas: 3        │  │
│ 👥 Pacien│  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
│ 📅 Agenda│  ┌──────────────────────┐  ┌──────────────────────┐         │
│         │  │ 📈 Visitas Semana    │  │ 💰 Facturación Mes   │         │
│ 👩‍⚕️ Equipo│  │     [Chart]         │  │     [Chart]          │         │
│         │  │                      │  │                      │         │
│ 📋 Reportes│  └──────────────────────┘  └──────────────────────┘         │
│         │                                                               │
│ 💰 Factur│  ┌─────────────────────────────────────────────────────────┐  │
│         │  │ Próximas Visitas                              [Ver todas]│  │
│ ⚙️ Config│  │ ┌─────────────────────────────────────────────────────┐ │  │
│         │  │ │ 🏠 María López    │ Enf. García │ 10:00 │ Curaciones │ │  │
│         │  │ ├─────────────────────────────────────────────────────┤ │  │
│         │  │ │ 🏠 Juan Pérez     │ Enf. Ruiz   │ 11:30 │ Control    │ │  │
│         │  │ └─────────────────────────────────────────────────────┘ │  │
│         │  └─────────────────────────────────────────────────────────┘  │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

**React Implementation:**
```jsx
// Layout structure
<div className="min-h-screen bg-gray-50">
  {/* Top Nav */}
  <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="w-5 h-5" />
      </Button>
      <Logo className="h-8" />
    </div>
    
    <div className="flex-1 max-w-md mx-4 hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Buscar pacientes, visitas..." 
          className="pl-10"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">Juan Director</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        {/* Dropdown content */}
      </DropdownMenu>
    </div>
  </header>
  
  <div className="flex">
    {/* Sidebar */}
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            active={item.active}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    
    {/* Main Content */}
    <main className="flex-1 p-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Visitas Hoy" 
          value={47} 
          change={+12} 
          icon={Activity}
        />
        <StatCard 
          title="Pendientes" 
          value={12} 
          change={-3} 
          icon={Clock}
        />
        <StatCard 
          title="Alertas" 
          value={3} 
          variant="warning" 
          icon={AlertTriangle}
        />
        <StatCard 
          title="Satisfacción" 
          value="94%" 
          change={+2} 
          icon={Heart}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitas por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={visitData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Facturación Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={billingData} />
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Visits Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximas Visitas</CardTitle>
          <Button variant="outline" size="sm">Ver todas</Button>
        </CardHeader>
        <CardContent>
          <VisitsTable visits={upcomingVisits} />
        </CardContent>
      </Card>
    </main>
  </div>
</div>
```

---

#### Option B: "Focus Mode" (Minimal Sidebar, Content-First)

**Best For:** Streamlined workflows, users who need to focus on one task at a time.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [IPS-ERP]  Panel  Pacientes  Agenda  Equipo  Reportes       [🔔] [👤]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         Buenos días, Juan 👋                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  [Tab: Hoy]  [Semana]  [Mes]                                        ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │                                                                     ││
│  │  47 Visitas programadas                      3 Requieren atención   ││
│  │                                                                     ││
│  │  ┌──────────────────────────────────────────────────────────────┐  ││
│  │  │ 09:00  María López       Curaciones    Enf. García    [→]    │  ││
│  │  │ 10:30  Juan Pérez        Control       Enf. Ruiz      [→]    │  ││
│  │  │ 11:00  Ana Martínez      Terapia       Fisio Torres   [→]    │  ││
│  │  └──────────────────────────────────────────────────────────────┘  ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```jsx
<div className="min-h-screen bg-gray-50">
  {/* Horizontal Nav */}
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Logo className="h-8" />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.active 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  </header>
  
  {/* Main Content - Centered */}
  <main className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-semibold text-gray-900">
      Buenos días, Juan 👋
    </h1>
    
    <div className="mt-6">
      <Tabs defaultValue="hoy">
        <TabsList>
          <TabsTrigger value="hoy">Hoy</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="mes">Mes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hoy" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg">
              <span className="font-semibold">47</span> Visitas programadas
            </p>
            <Badge variant="warning">3 Requieren atención</Badge>
          </div>
          
          <div className="space-y-2">
            {visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </main>
</div>
```

---

### Nurse Mobile App Patterns

**Design Philosophy:** Speed, Offline-First, One-Handed Operation

#### Pattern 1: "Task-Centric" (HCHB-Inspired)
```
┌──────────────────────────┐
│ ← Mi Día         [≡] [🔔]│
├──────────────────────────┤
│                          │
│  Hola, María 👋           │
│  4 visitas hoy           │
│                          │
│  ┌────────────────────┐  │
│  │ 🟢 09:00           │  │
│  │ María López        │  │
│  │ Curaciones         │  │
│  │ 📍 Cra 7 #45-23    │  │
│  │                    │  │
│  │ [Iniciar Visita →] │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ ⏳ 10:30           │  │
│  │ Juan Pérez         │  │
│  │ Control signos     │  │
│  │ 📍 Calle 100 #15   │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ ⏳ 12:00           │  │
│  │ Ana Martínez       │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│  [🏠]  [📅]  [👤]  [⚙️]  │
└──────────────────────────┘
```

**React Native / Expo Implementation:**
```jsx
// screens/MyDay.tsx
export function MyDayScreen() {
  const { visits, isLoading } = useVisits();
  const currentVisit = visits.find(v => v.status === 'in-progress');
  const nextVisit = visits.find(v => v.status === 'scheduled');
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Greeting */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Hola, María 👋
          </Text>
          <Text className="text-gray-600 mt-1">
            {visits.length} visitas hoy
          </Text>
        </View>
        
        {/* Current/Next Visit - Prominent */}
        {nextVisit && (
          <VisitCard 
            visit={nextVisit} 
            variant="primary"
            onStartVisit={() => startVisit(nextVisit.id)}
          />
        )}
        
        {/* Rest of visits */}
        <View className="mt-4 space-y-3">
          {visits.filter(v => v.id !== nextVisit?.id).map((visit) => (
            <VisitCard 
              key={visit.id} 
              visit={visit} 
              variant="default"
            />
          ))}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
}

// components/VisitCard.tsx
function VisitCard({ visit, variant = 'default', onStartVisit }) {
  return (
    <Pressable 
      className={cn(
        "rounded-xl p-4",
        variant === 'primary' 
          ? "bg-white border-2 border-blue-500 shadow-lg" 
          : "bg-white border border-gray-200"
      )}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className={cn(
            "w-3 h-3 rounded-full",
            visit.status === 'scheduled' && "bg-blue-500",
            visit.status === 'in-progress' && "bg-green-500",
            visit.status === 'completed' && "bg-gray-400"
          )} />
          <Text className="font-semibold text-gray-900">
            {visit.scheduledTime}
          </Text>
        </View>
        <Badge>{visit.visitType}</Badge>
      </View>
      
      <Text className="text-lg font-semibold text-gray-900">
        {visit.patientName}
      </Text>
      
      <View className="flex-row items-center gap-1 mt-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <Text className="text-gray-600 flex-1" numberOfLines={1}>
          {visit.address}
        </Text>
      </View>
      
      {variant === 'primary' && onStartVisit && (
        <Pressable 
          onPress={onStartVisit}
          className="mt-4 bg-blue-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
        >
          <Text className="text-white font-semibold mr-2">
            Iniciar Visita
          </Text>
          <ArrowRight className="w-5 h-5 text-white" />
        </Pressable>
      )}
    </Pressable>
  );
}
```

#### Pattern 2: "Quick Documentation" (During Visit)
```
┌──────────────────────────┐
│ ← Visita en Curso   [⋮] │
├──────────────────────────┤
│                          │
│  María López             │
│  CC 123456789            │
│  ⏱️ 15:23 transcurrido    │
│                          │
│  ──────────────────────  │
│                          │
│  📋 Documentación Rápida │
│                          │
│  Signos Vitales          │
│  ┌────────────────────┐  │
│  │ PA: [___/___]      │  │
│  │ FC: [___] bpm      │  │
│  │ Temp: [___]°C      │  │
│  │ SpO2: [___]%       │  │
│  └────────────────────┘  │
│                          │
│  [📷 Agregar Foto]       │
│                          │
│  [🎤 Nota de Voz]        │
│                          │
│  ┌────────────────────┐  │
│  │ Observaciones...   │  │
│  │                    │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│  [Finalizar Visita ✓]    │
└──────────────────────────┘
```

**Key Mobile UX Patterns:**

1. **Large Touch Targets** (min 48x48dp)
```jsx
<Pressable className="min-h-[48px] min-w-[48px] p-3">
```

2. **Offline Indicator**
```jsx
<View className="flex-row items-center gap-2 bg-yellow-100 px-3 py-2 rounded-full">
  <WifiOff className="w-4 h-4 text-yellow-700" />
  <Text className="text-yellow-700 text-sm font-medium">
    Modo offline - Se sincronizará automáticamente
  </Text>
</View>
```

3. **Swipe Actions**
```jsx
<Swipeable
  renderRightActions={() => (
    <View className="bg-green-500 justify-center px-6">
      <Check className="w-6 h-6 text-white" />
    </View>
  )}
  onSwipeableRightOpen={() => completeVisit(visit.id)}
>
  <VisitCard visit={visit} />
</Swipeable>
```

---

### Family Portal Designs

**Design Philosophy:** Simplicity, Reassurance, Clear Communication

#### Portal Layout
```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  Estado de María  |  Historial  |  Mensajes  [👤]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│   👋 Hola, Carlos                                        │
│                                                          │
│   Estado actual de María López                           │
│   ────────────────────────────────────────               │
│                                                          │
│   ┌────────────────────────────────────────────────────┐ │
│   │  🟢 Todo en orden                                  │ │
│   │                                                    │ │
│   │  Última visita: Hoy, 10:30 AM                     │ │
│   │  Enfermera: María García                          │ │
│   │  Tipo: Curaciones y control de signos              │ │
│   │                                                    │ │
│   │  [Ver resumen de visita →]                        │ │
│   └────────────────────────────────────────────────────┘ │
│                                                          │
│   Próxima visita                                         │
│   ┌────────────────────────────────────────────────────┐ │
│   │  📅 Mañana, 9:00 AM                               │ │
│   │  Enfermera: María García                          │ │
│   │  Tipo: Control de signos vitales                  │ │
│   │                                                    │ │
│   │  [Agregar al calendario]                          │ │
│   └────────────────────────────────────────────────────┘ │
│                                                          │
│   ¿Tiene alguna inquietud?                              │
│   [💬 Enviar mensaje a la IPS]                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Implementation:**
```jsx
// Family portal - Calm, reassuring design
export function FamilyPortal() {
  const { patient, lastVisit, nextVisit, status } = usePatientStatus();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo className="h-8" />
          <nav className="flex items-center gap-6">
            <Link href="/estado" className="text-blue-600 font-medium">
              Estado de {patient.firstName}
            </Link>
            <Link href="/historial" className="text-gray-600 hover:text-gray-900">
              Historial
            </Link>
            <Link href="/mensajes" className="text-gray-600 hover:text-gray-900">
              Mensajes
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting */}
        <p className="text-lg text-gray-600">
          👋 Hola, {familyMember.firstName}
        </p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">
          Estado actual de {patient.fullName}
        </h1>
        
        {/* Status Card - The main reassurance element */}
        <Card className="mt-6 border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-green-800">
                  Todo en orden
                </p>
                <p className="text-green-700">
                  Última visita: {formatDate(lastVisit.date)}
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <span>Enfermera: {lastVisit.nurseName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clipboard className="w-4 h-4" />
                <span>Tipo: {lastVisit.visitType}</span>
              </div>
            </div>
            
            <Button variant="outline" className="mt-4 w-full">
              Ver resumen de visita →
            </Button>
          </CardContent>
        </Card>
        
        {/* Next Visit */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Próxima visita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">
                  {formatDate(nextVisit.date)}, {nextVisit.time}
                </p>
                <p className="text-sm text-gray-600">
                  {nextVisit.visitType}
                </p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="mt-4">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Agregar al calendario
            </Button>
          </CardContent>
        </Card>
        
        {/* Contact */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-gray-600">¿Tiene alguna inquietud?</p>
            <Button className="mt-3 w-full">
              <MessageCircle className="w-5 h-5 mr-2" />
              Enviar mensaje a la IPS
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

---

## Design System Recommendations

### Color Schemes for Healthcare

#### Primary Palette: "Trust Blue"
```css
/* Tailwind Config */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary - Trust Blue
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Secondary - Calm Teal (for accents)
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        
        // Semantic colors
        success: '#10b981', // Green for positive status
        warning: '#f59e0b', // Amber for alerts
        error: '#ef4444',   // Red for errors
        info: '#3b82f6',    // Blue for information
        
        // Neutral grays
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
};
```

#### Alternative Palette: "Modern Healthcare"
```css
colors: {
  // Indigo-based (more modern, tech-forward)
  primary: {
    500: '#6366f1', // Indigo
    600: '#4f46e5',
    700: '#4338ca',
  },
  
  // Purple accents
  accent: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
}
```

#### Status Colors for Healthcare
```jsx
const STATUS_COLORS = {
  // Patient status
  stable: 'bg-green-100 text-green-800 border-green-200',
  needsAttention: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  
  // Visit status
  scheduled: 'bg-blue-100 text-blue-800',
  inProgress: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Task priority
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};
```

---

### Typography Choices

#### Recommended Font Pairing

**Option 1: Inter + System Stack (Recommended)**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, 'Courier New', monospace;
}
```

**Option 2: Plus Jakarta Sans (Modern Healthcare)**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

#### Type Scale
```css
/* Tailwind-based type scale */
const typography = {
  // Display (heroes, landing pages)
  'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
  'display-lg': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
  'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
  
  // Headings (dashboard, content)
  'heading-xl': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
  'heading-lg': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
  'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
  'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
  
  // Body text
  'body-lg': ['1.125rem', { lineHeight: '1.75' }],
  'body-md': ['1rem', { lineHeight: '1.75' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  
  // UI text (buttons, labels)
  'label-lg': ['0.875rem', { lineHeight: '1', fontWeight: '500' }],
  'label-md': ['0.75rem', { lineHeight: '1', fontWeight: '500' }],
  'label-sm': ['0.625rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.05em' }],
};
```

#### Typography Best Practices for Healthcare
```jsx
// Clear hierarchy for medical information
<div className="space-y-2">
  <h2 className="text-xl font-semibold text-gray-900">
    Signos Vitales
  </h2>
  <div className="text-3xl font-bold text-blue-600">
    120/80 <span className="text-lg font-normal text-gray-500">mmHg</span>
  </div>
  <p className="text-sm text-gray-600">
    Presión arterial dentro del rango normal
  </p>
</div>
```

---

### Component Patterns

#### Stat Card Component
```jsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon,
  variant = 'default' 
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-white',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };
  
  return (
    <Card className={cn("relative overflow-hidden", variantStyles[variant])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                change > 0 ? "text-green-600" : "text-red-600"
              )}>
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                {changeLabel && (
                  <span className="text-gray-500 font-normal">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Data Table with Patient Context
```jsx
interface Visit {
  id: string;
  patientName: string;
  patientId: string;
  scheduledTime: string;
  visitType: string;
  nurseName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
}

export function VisitsTable({ visits }: { visits: Visit[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Paciente</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Enfermera</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <TableRow key={visit.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {visit.patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{visit.patientName}</p>
                  <p className="text-sm text-gray-500">CC {visit.patientId}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {visit.priority === 'high' && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                )}
                {visit.scheduledTime}
              </div>
            </TableCell>
            <TableCell>{visit.visitType}</TableCell>
            <TableCell>{visit.nurseName}</TableCell>
            <TableCell>
              <Badge variant={visit.status}>
                {visitStatusLabels[visit.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Cancelar visita
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### Empty State
```jsx
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1 max-w-sm">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  icon={Calendar}
  title="No hay visitas programadas"
  description="Programa la primera visita para este paciente"
  action={{
    label: "Programar visita",
    icon: Plus,
    onClick: () => openScheduleModal(),
  }}
/>
```

---

### Spacing & Layout Principles

#### Spacing Scale (8px Base)
```css
/* Tailwind spacing scale */
spacing: {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px  ← Base unit
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px ← Common padding
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px ← Section spacing
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px ← Large sections
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
}
```

#### Layout Grid System
```jsx
// Container widths
const containerWidths = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Wide screens
};

// Standard page layouts
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Full-width container with responsive padding */}
</div>

<div className="max-w-4xl mx-auto px-4">
  {/* Focused content (forms, articles) */}
</div>

<div className="max-w-2xl mx-auto px-4">
  {/* Narrow content (modals, dialogs) */}
</div>
```

#### Dashboard Grid
```jsx
// Responsive dashboard grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {/* Stat cards */}
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content - 2/3 width */}
  </div>
  <div>
    {/* Sidebar content - 1/3 width */}
  </div>
</div>
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance for Healthcare

#### Color Contrast Requirements
```jsx
// Minimum contrast ratios
const contrastRequirements = {
  normalText: 4.5,    // Normal text (< 18pt)
  largeText: 3.0,     // Large text (≥ 18pt or 14pt bold)
  uiComponents: 3.0,  // UI components and graphics
};

// Accessible color combinations
const accessiblePairs = {
  primaryText: {
    background: '#ffffff',
    foreground: '#1f2937', // gray-800 (contrast: 12.63:1)
  },
  secondaryText: {
    background: '#ffffff',
    foreground: '#4b5563', // gray-600 (contrast: 7.52:1)
  },
  link: {
    background: '#ffffff',
    foreground: '#2563eb', // blue-600 (contrast: 4.52:1)
  },
  errorText: {
    background: '#ffffff',
    foreground: '#dc2626', // red-600 (contrast: 4.52:1)
  },
};
```

#### Focus States
```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Component-specific */
.btn:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
```

#### Screen Reader Considerations
```jsx
// Announce dynamic content changes
<div 
  role="status" 
  aria-live="polite"
  className="sr-only"
>
  Visita programada exitosamente para {patientName}
</div>

// Table accessibility
<table role="grid" aria-label="Lista de visitas del día">
  <caption className="sr-only">
    Visitas programadas para hoy, ordenadas por hora
  </caption>
  {/* ... */}
</table>

// Form field accessibility
<div>
  <Label htmlFor="blood-pressure">Presión Arterial</Label>
  <Input 
    id="blood-pressure"
    aria-describedby="bp-hint bp-error"
    aria-invalid={hasError}
  />
  <p id="bp-hint" className="text-sm text-gray-500">
    Formato: sistólica/diastólica (ej: 120/80)
  </p>
  {hasError && (
    <p id="bp-error" className="text-sm text-red-600" role="alert">
      El valor debe estar entre 60/40 y 250/150
    </p>
  )}
</div>
```

#### Keyboard Navigation
```jsx
// Keyboard-accessible dropdown
const [isOpen, setIsOpen] = useState(false);
const [focusedIndex, setFocusedIndex] = useState(-1);

const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, items.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
      break;
    case 'Enter':
    case ' ':
      if (focusedIndex >= 0) {
        selectItem(items[focusedIndex]);
      }
      break;
    case 'Escape':
      setIsOpen(false);
      break;
  }
};
```

---

## Implementation Roadmap

### Phase 1: Design System Foundation (Week 1-2)
- [ ] Set up TailwindCSS configuration with brand colors
- [ ] Create typography scale and components
- [ ] Build core components (Button, Card, Input, Table)
- [ ] Document in Storybook

### Phase 2: Landing Page (Week 2-3)
- [ ] Implement "Trust & Authority" hero section
- [ ] Create solution cards section
- [ ] Build testimonial component
- [ ] Add compliance badges section
- [ ] Mobile responsive optimization

### Phase 3: Admin Dashboard (Week 3-5)
- [ ] Implement command center layout
- [ ] Build stat cards with real data
- [ ] Create visits table with actions
- [ ] Add charts (visits, billing)
- [ ] Implement search (⌘K)

### Phase 4: Mobile Nurse App (Week 5-7)
- [ ] Convert to React Native / Expo
- [ ] Implement task-centric home screen
- [ ] Build visit documentation flow
- [ ] Add offline support
- [ ] GPS integration for visits

### Phase 5: Family Portal (Week 7-8)
- [ ] Simple web portal design
- [ ] Patient status dashboard
- [ ] Visit history view
- [ ] Messaging system

### Phase 6: Polish & Accessibility (Week 8-9)
- [ ] WCAG 2.1 AA audit
- [ ] Performance optimization
- [ ] User testing with real IPS staff
- [ ] Iterate based on feedback

---

## Appendix: Component Library Checklist

### Core Components
- [ ] Button (variants: primary, secondary, outline, ghost, destructive)
- [ ] Input (text, number, date, time)
- [ ] Select / Dropdown
- [ ] Checkbox / Radio
- [ ] Switch / Toggle
- [ ] Textarea
- [ ] Badge
- [ ] Avatar
- [ ] Card
- [ ] Table
- [ ] Tabs
- [ ] Modal / Dialog
- [ ] Toast / Notification
- [ ] Tooltip
- [ ] Dropdown Menu
- [ ] Skeleton Loader

### Healthcare-Specific Components
- [ ] PatientCard
- [ ] VisitCard
- [ ] VitalSignsInput
- [ ] ClinicalScaleForm
- [ ] StatusIndicator
- [ ] AppointmentCalendar
- [ ] NurseAvatar
- [ ] ComplianceBadge
- [ ] ProgressRing
- [ ] TimelineEvent

### Layout Components
- [ ] AppShell (sidebar + header)
- [ ] PageHeader
- [ ] Section
- [ ] EmptyState
- [ ] ErrorBoundary
- [ ] LoadingScreen

---

*Document generated by UI/UX Research Agent - IPS-ERP Project*
