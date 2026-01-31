#!/bin/bash
# Quick preview update - inline components with updated images

cat > preview-v2.html << 'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IPS-ERP - Sistema ERP para Atención Domiciliaria (Beta)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 1s; }
    </style>
</head>
<body class="bg-gray-50">

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center overflow-hidden">
    <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80" 
             alt="Enfermera profesional visitando paciente en casa" 
             class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/85 to-transparent"></div>
    </div>
    
    <div class="relative z-10 container mx-auto px-4 lg:px-8 pt-32 pb-20">
        <div class="max-w-3xl">
            <div class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span class="text-sm text-white/90 font-medium">En desarrollo — Lanzamiento Q2 2026 — Únete al programa beta</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                ERP Inteligente para 
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                    IPS de Cuidado Domiciliario
                </span>
                <br/>Built for Colombian Healthcare
            </h1>

            <p class="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
                Plataforma integral con IA (Amazon Bedrock) diseñada para gestión domiciliaria. 
                RIPS automático, defensa de glosas, y optimización de equipos. <strong>Lanzamiento Q2 2026.</strong>
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mb-16">
                <a href="#early-access" 
                   class="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-900 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-xl">
                    Solicitar Acceso Anticipado →
                </a>
                <a href="#product" 
                   class="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all">
                    Ver el Producto
                </a>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
                <div>
                    <div class="text-3xl font-bold mb-1">Q2 2026</div>
                    <div class="text-sm text-white/70">Lanzamiento</div>
                    <div class="text-xs text-white/50">Acceso Anticipado</div>
                </div>
                <div>
                    <div class="text-3xl font-bold mb-1">IA</div>
                    <div class="text-sm text-white/70">Powered</div>
                    <div class="text-xs text-white/50">Amazon Bedrock</div>
                </div>
                <div>
                    <div class="text-3xl font-bold mb-1">100%</div>
                    <div class="text-sm text-white/70">Colombian</div>
                    <div class="text-xs text-white/50">RIPS Compliant</div>
                </div>
                <div>
                    <div class="text-3xl font-bold mb-1">Beta</div>
                    <div class="text-sm text-white/70">Program</div>
                    <div class="text-xs text-white/50">Únete Ahora</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Challenges Section -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-4 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Los desafíos que enfrentan las IPS hoy</h2>
            <p class="text-xl text-gray-600">Problemas reales que impactan sus ingresos y operaciones diarias</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-red-50 border border-red-100 rounded-2xl p-6">
                <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">Glosas</h3>
                <p class="text-sm text-gray-600 mb-4">30% de facturas rechazadas por errores</p>
                <div class="text-3xl font-bold text-red-600">30%</div>
            </div>

            <div class="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">RIPS Manual</h3>
                <p class="text-sm text-gray-600 mb-4">Horas semanales en reportes</p>
                <div class="text-3xl font-bold text-amber-600">8+ hrs</div>
            </div>

            <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">Roster</h3>
                <p class="text-sm text-gray-600 mb-4">Tiempo perdido en asignaciones</p>
                <div class="text-3xl font-bold text-blue-600">2h 45m</div>
            </div>

            <div class="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">Compliance</h3>
                <p class="text-sm text-gray-600 mb-4">Sanciones por incumplimiento</p>
                <div class="text-3xl font-bold text-purple-600">$$$</div>
            </div>
        </div>
    </div>
</section>

<!-- Early Access CTA -->
<section id="early-access" class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div class="container mx-auto px-4 lg:px-8">
        <div class="max-w-3xl mx-auto text-center text-white">
            <h2 class="text-4xl font-bold mb-6">Únete al Programa Beta</h2>
            <p class="text-xl mb-8 text-white/90">
                Producto en desarrollo activo. Lanzamiento Q2 2026. 
                <br/>Sé de los primeros en probarlo.
            </p>
            <form class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input type="email" 
                       placeholder="tu@ips.com" 
                       class="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30">
                <button type="submit" 
                        class="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-xl">
                    Solicitar Acceso
                </button>
            </form>
            <p class="text-sm text-white/60 mt-4">Sin compromiso. Te contactaremos cuando estemos listos.</p>
        </div>
    </div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4 lg:px-8 text-center">
        <p class="text-gray-400">© 2026 IPS-ERP. Producto en desarrollo. Lanzamiento Q2 2026.</p>
        <p class="text-gray-500 text-sm mt-2">Built with AWS Bedrock AI • TypeScript • React</p>
    </div>
</footer>

</body>
</html>
HTML

echo "preview-v2.html created"
