# Guía de Usuario - Panel de Administración IPS ERP

**Versión:** 1.0  
**Fecha:** 23 de Enero, 2026  
**Audiencia:** Administradores de IPS (Instituciones Prestadoras de Servicios de Salud)

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel de Facturación](#panel-de-facturación)
4. [Glosa Defender - Defensa AI](#glosa-defender---defensa-ai)
5. [Validador de RIPS](#validador-de-rips)
6. [Manejo de Errores](#manejo-de-errores)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Preguntas Frecuentes](#preguntas-frecuentes)
9. [Soporte Técnico](#soporte-técnico)

---

## Introducción

El Panel de Administración de IPS ERP le permite gestionar la facturación de servicios de atención domiciliaria con dos herramientas potenciadas por Inteligencia Artificial:

1. **Glosa Defender** - Genera cartas de defensa técnica para contestar glosas de facturación
2. **Validador de RIPS** - Valida el cumplimiento de la Resolución 2275 antes del envío al Ministerio

Estas herramientas automatizan procesos que tradicionalmente tomaban horas, reduciendo el tiempo de respuesta y mejorando la calidad de las defensas técnicas.

---

## Acceso al Sistema

### Requisitos Previos

- **Navegador:** Chrome, Firefox, Safari o Edge (última versión)
- **Conexión:** Internet estable (mínimo 5 Mbps)
- **Credenciales:** Usuario y contraseña proporcionados por el administrador del sistema
- **Rol:** Debe tener rol de ADMIN en el sistema

### Inicio de Sesión

1. Navegue a: `https://main.d2wwgecog8smmr.amplifyapp.com`
2. Ingrese su correo electrónico
3. Ingrese su contraseña
4. Haga clic en "Iniciar Sesión"

**Nota:** Si es su primer inicio de sesión, se le pedirá cambiar la contraseña temporal.

### Navegación al Panel de Facturación

1. Desde el menú principal, seleccione "Facturación"
2. Verá el Dashboard de Facturación con:
   - Métricas de facturación (Total Facturado, Glosas Pendientes, Compliance RIPS)
   - Lista de facturas recientes
   - Panel de AI Billing Assistant (lado derecho)

---

## Panel de Facturación

### Vista General

El panel muestra tres métricas principales:

**1. Total Facturado (HFC)**
- Monto total facturado en el período actual
- Indicador de crecimiento vs. período anterior
- Ejemplo: $42.5M (+12%)

**2. Glosas Pendientes**
- Monto total de glosas sin resolver
- Porcentaje del total facturado
- Ejemplo: $3.4M (8.2%)

**3. RIPS 2275 Compliance**
- Porcentaje de cumplimiento de la norma técnica
- Estado: Pure (100%) o porcentaje actual
- Ejemplo: 100% Pure

### Lista de Facturas Recientes

Cada factura muestra:
- **Número de Factura:** Ej. FE-1025
- **Valor:** Monto total en pesos colombianos
- **Estado:** PAID (Pagada), PENDING (Pendiente), CANCELED (Cancelada), GLOSED (Con Glosa)
- **Fecha de Radicación:** Fecha de envío a la EPS

**Acciones Disponibles:**
- Ver más facturas (botón "Ver más facturas" al final de la lista)
- Descargar reporte (ícono de descarga en la esquina superior derecha)

---

## Glosa Defender - Defensa AI

### ¿Qué es Glosa Defender?

Glosa Defender es una herramienta de Inteligencia Artificial que genera cartas de defensa técnica para contestar glosas de facturación. La IA analiza la historia clínica del paciente y genera un sustento técnico basado en:

- Signos vitales registrados
- Procedimientos realizados
- Medicamentos administrados
- Diagnósticos CIE-10
- Normativa colombiana (Resolución 3047, etc.)

### Cuándo Usar Glosa Defender

Use esta herramienta cuando:
- Reciba una glosa de una EPS
- Necesite justificar la necesidad médica de un procedimiento
- Requiera un sustento técnico para apelar una negación
- Deba responder en tiempo limitado (24-48 horas)

### Cómo Generar una Carta de Defensa

#### Paso 1: Ubicar la Factura

1. En el Panel de Facturación, identifique la factura con glosa
2. Busque el estado "GLOSED" en la lista de facturas
3. Anote el ID de la factura (necesario para el proceso)

#### Paso 2: Iniciar Generación

1. En el panel "AI Billing Assistant" (lado derecho)
2. Localice la tarjeta "Glosa Defender"
3. Haga clic en "Generar Respuesta AI"

**Nota:** El sistema automáticamente usará la primera factura disponible. En futuras versiones podrá seleccionar la factura específica.

#### Paso 3: Esperar Procesamiento

- Verá un spinner y el texto "Generando..."
- El proceso toma entre 15-30 segundos
- **No cierre la ventana ni navegue a otra página**

#### Paso 4: Revisar la Carta Generada

Una vez completado, aparecerá un modal con:
- **Título:** "Carta de Defensa Generada"
- **Contenido:** Texto completo de la defensa en español
- **Botones:** "Cerrar" y "Copiar al Portapapeles"

#### Paso 5: Editar y Usar la Carta

1. **Revisar:** Lea cuidadosamente el contenido generado
2. **Editar:** Puede modificar el texto directamente en el modal
3. **Copiar:** Haga clic en "Copiar al Portapapeles"
4. **Pegar:** Pegue el contenido en su sistema de gestión de glosas

### Ejemplo de Carta Generada

```
# Defensa Técnica para Glosa FE-882

**Paciente:** Juan Pérez
**Procedimiento:** Atención de Enfermería Domiciliaria (S0201)
**Fecha:** 15 de Enero, 2026

Con base en la revisión de la historia clínica, la glosa referente a 
"Falta de necesidad médica" carece de fundamento. Los signos vitales 
del paciente el 15/01 muestran hipertensión aguda (150/95 mmHg) que 
requirió intervención farmacológica inmediata administrada por la 
enfermera.

**Referencia:** Resolución 3047, Artículo 12.
```

### Qué Hacer Después

1. **Guardar:** Guarde una copia de la carta en su sistema
2. **Adjuntar:** Adjunte evidencia clínica (signos vitales, KARDEX)
3. **Enviar:** Envíe la respuesta a la EPS dentro del plazo establecido
4. **Seguimiento:** Registre la respuesta en el sistema de glosas

---

## Validador de RIPS

### ¿Qué es el Validador de RIPS?

El Validador de RIPS es una herramienta que verifica el cumplimiento de la Resolución 2275 de 2014 antes de enviar los archivos al portal del Ministerio de Salud. Valida:

- **Estructura de archivos:** AC, AP, US, AM, AT
- **Consistencia de datos:** Cédula vs. Diagnóstico
- **Formatos de fecha:** YYYY-MM-DD
- **Códigos:** CUPS y CIE-10

### Cuándo Usar el Validador

Use esta herramienta:
- **Antes de radicar:** Valide antes de enviar al Ministerio
- **Después de correcciones:** Verifique que los errores fueron corregidos
- **Periódicamente:** Valide mensualmente para mantener compliance
- **Antes de auditorías:** Asegure calidad de datos

### Cómo Validar Archivos RIPS

#### Paso 1: Preparar Archivos

1. Genere los archivos RIPS desde su sistema de facturación
2. Asegúrese de tener todos los archivos requeridos:
   - **AC:** Consultas
   - **AP:** Procedimientos
   - **US:** Urgencias
   - **AM:** Medicamentos
   - **AT:** Otros servicios
3. Comprima los archivos en formato .zip (opcional)

#### Paso 2: Acceder al Validador

1. En el Panel de Facturación, localice "AI Billing Assistant"
2. Haga clic en la tarjeta "RIPS 2275 Validator"
3. Se abrirá la interfaz del validador

#### Paso 3: Ingresar ID de Facturación

1. En el campo "ID de Registro de Facturación"
2. Ingrese el UUID del registro de facturación
3. Ejemplo: `123e4567-e89b-12d3-a456-426614174000`

**¿Dónde encontrar el ID?**
- En la lista de facturas, haga clic en "Ver detalles"
- El ID aparece en la URL o en los detalles de la factura

#### Paso 4: Cargar Archivos

1. Haga clic en la zona de carga (área con ícono de subida)
2. Seleccione su archivo .zip o .txt
3. Verá el nombre del archivo seleccionado

#### Paso 5: Iniciar Validación

1. Haga clic en "Iniciar Validación Técnica"
2. El botón se deshabilitará y mostrará "Validando..."
3. Verá un spinner y el mensaje "Analizando reglas de negocio..."
4. El proceso toma entre 5-15 segundos

#### Paso 6: Interpretar Resultados

**Resultado: RIPS VÁLIDO ✅**
- Fondo verde con borde verde
- Mensaje: "RIPS VÁLIDO"
- "0 errores críticos"
- Puede proceder con la radicación

**Resultado: RIPS CON ERRORES ❌**
- Fondo rojo con borde rojo
- Mensaje: "RIPS CON ERRORES"
- Número de errores críticos
- Lista detallada de errores

### Ejemplo de Errores Comunes

**Error 1: Código de Procedimiento Inválido**
```
Line 4: Invalid Procedure Code
```
**Solución:** Verifique que el código CUPS sea válido y esté actualizado

**Error 2: Falta ID de Paciente**
```
Line 12: Missing Patient ID
```
**Solución:** Complete el campo de identificación del paciente

**Error 3: Formato de Fecha Incorrecto**
```
Line 8: Invalid Date Format (expected YYYY-MM-DD)
```
**Solución:** Cambie el formato de fecha a YYYY-MM-DD

**Error 4: Inconsistencia Cédula vs. Diagnóstico**
```
Line 15: Patient ID mismatch between AC and AP files
```
**Solución:** Verifique que la cédula sea la misma en todos los archivos

### Qué Hacer con los Resultados

**Si la validación es exitosa:**
1. Descargue el reporte de validación (próximamente)
2. Proceda con la radicación en el portal del Ministerio
3. Guarde el reporte como evidencia de compliance

**Si hay errores:**
1. Anote todos los errores listados
2. Corrija los errores en su sistema de facturación
3. Regenere los archivos RIPS
4. Vuelva a validar hasta obtener resultado exitoso
5. **No radique archivos con errores** - serán rechazados

---

## Manejo de Errores

### Tipos de Errores

#### 1. Error de Timeout

**Mensaje:**
```
La operación tardó demasiado. Por favor intente nuevamente.
```

**Causa:**
- Procesamiento AI tomó más de 60 segundos (Glosa Defender)
- Validación tomó más de 30 segundos (RIPS Validator)
- Problemas de red o servidor

**Solución:**
1. Espere 1 minuto
2. Intente nuevamente
3. Si persiste, contacte soporte técnico

#### 2. Error de Registro No Encontrado

**Mensaje:**
```
No se encontró el registro de facturación especificado.
```

**Causa:**
- ID de facturación incorrecto
- Factura pertenece a otra IPS (multi-tenant)
- Factura fue eliminada

**Solución:**
1. Verifique el ID de facturación
2. Copie y pegue el ID completo (sin espacios)
3. Confirme que la factura existe en su lista
4. Si persiste, contacte soporte técnico

#### 3. Error de Permisos

**Mensaje:**
```
No tiene permisos para realizar esta operación.
```

**Causa:**
- Usuario no tiene rol de ADMIN
- Sesión expiró
- Token de autenticación inválido

**Solución:**
1. Cierre sesión y vuelva a iniciar sesión
2. Verifique que su usuario tenga rol de ADMIN
3. Contacte al administrador del sistema para verificar permisos

#### 4. Error de Conexión

**Mensaje:**
```
Error de conexión. Verifique su conexión a internet.
```

**Causa:**
- Internet desconectado
- Firewall bloqueando la conexión
- Servidor temporalmente no disponible

**Solución:**
1. Verifique su conexión a internet
2. Intente abrir otra página web
3. Desactive VPN si está usando una
4. Espere 5 minutos y reintente
5. Si persiste, contacte soporte técnico

#### 5. Error Genérico

**Mensaje:**
```
Error al generar respuesta AI. Por favor intente nuevamente.
```
o
```
Error al validar RIPS. Por favor intente nuevamente.
```

**Causa:**
- Error interno del servidor
- Servicio de AI temporalmente no disponible
- Error inesperado

**Solución:**
1. Intente nuevamente en 1 minuto
2. Si persiste después de 3 intentos, contacte soporte técnico
3. Proporcione la hora exacta del error para investigación

### Cómo Reportar Errores

Cuando contacte soporte técnico, proporcione:

1. **Hora exacta del error:** Ej. "23 de Enero, 2026 - 14:35"
2. **Mensaje de error completo:** Copie el texto exacto
3. **Acción que estaba realizando:** Ej. "Generando carta de defensa"
4. **ID de facturación:** Si aplica
5. **Capturas de pantalla:** Si es posible

---

## Mejores Prácticas

### Para Glosa Defender

**✅ Hacer:**
- Revisar y editar la carta generada antes de enviar
- Adjuntar evidencia clínica (signos vitales, KARDEX)
- Guardar una copia de cada carta generada
- Usar lenguaje técnico apropiado
- Referenciar normativa colombiana cuando sea relevante

**❌ No Hacer:**
- Enviar la carta sin revisarla
- Confiar 100% en la IA sin validación humana
- Omitir evidencia clínica de soporte
- Usar la misma carta para diferentes glosas
- Ignorar el contexto específico del caso

### Para Validador de RIPS

**✅ Hacer:**
- Validar ANTES de radicar al Ministerio
- Corregir TODOS los errores antes de enviar
- Validar nuevamente después de correcciones
- Mantener registro de validaciones exitosas
- Validar periódicamente (mensual)

**❌ No Hacer:**
- Radicar archivos con errores
- Ignorar advertencias (warnings)
- Validar solo cuando hay problemas
- Omitir archivos requeridos (AC, AP, US)
- Usar formatos de fecha incorrectos

### Seguridad y Privacidad

**Protección de Datos:**
- Las cartas de defensa contienen información de salud protegida (PHI)
- Los archivos RIPS contienen identificadores de pacientes
- Todos los datos están encriptados en tránsito y en reposo
- El sistema cumple con normativa GDPR y colombiana

**Auditoría:**
- Todas las operaciones quedan registradas en el sistema
- Los logs incluyen usuario, fecha, hora y acción
- Los logs son inmutables (no se pueden modificar)
- Retención de logs: 7 años (cumplimiento regulatorio)

**Multi-Tenant:**
- Cada IPS tiene sus datos completamente aislados
- No puede acceder a datos de otras IPS
- El sistema valida permisos en cada operación

---

## Preguntas Frecuentes

### Glosa Defender

**P: ¿Cuánto tiempo toma generar una carta de defensa?**  
R: Entre 15-30 segundos en promedio. Depende de la complejidad del caso y la carga del servidor.

**P: ¿Puedo editar la carta generada?**  
R: Sí, el modal permite editar el texto directamente antes de copiarlo.

**P: ¿La IA siempre genera cartas correctas?**  
R: La IA genera cartas basadas en la historia clínica, pero siempre debe revisar y validar el contenido antes de enviar.

**P: ¿Qué pasa si no hay suficiente información clínica?**  
R: La IA generará una carta con la información disponible, pero puede ser menos detallada. Asegúrese de tener KARDEX completo.

**P: ¿Puedo usar la misma carta para múltiples glosas?**  
R: No recomendado. Cada glosa es única y requiere una defensa específica.

**P: ¿La carta se guarda automáticamente?**  
R: Sí, el contenido se guarda en el campo `glosaDefenseText` del registro de facturación.

### Validador de RIPS

**P: ¿Qué archivos RIPS puedo validar?**  
R: AC (Consultas), AP (Procedimientos), US (Urgencias), AM (Medicamentos), AT (Otros servicios).

**P: ¿Puedo validar archivos individuales o deben estar en .zip?**  
R: Puede validar archivos individuales (.txt) o comprimidos (.zip).

**P: ¿Qué versión de RIPS valida el sistema?**  
R: Resolución 2275 de 2014 (versión vigente en Colombia).

**P: ¿El validador reemplaza la validación del Ministerio?**  
R: No, es una pre-validación. El Ministerio puede tener validaciones adicionales.

**P: ¿Qué hago si hay errores que no entiendo?**  
R: Contacte soporte técnico con el mensaje de error completo y el archivo RIPS.

**P: ¿Puedo validar archivos de meses anteriores?**  
R: Sí, puede validar cualquier archivo RIPS independientemente de la fecha.

### General

**P: ¿Necesito internet para usar estas herramientas?**  
R: Sí, ambas herramientas requieren conexión a internet estable.

**P: ¿Puedo usar estas herramientas desde mi celular?**  
R: Sí, el sistema es responsive, pero se recomienda usar computadora para mejor experiencia.

**P: ¿Cuántas veces puedo usar estas herramientas?**  
R: Sin límite. Puede usar las herramientas tantas veces como necesite.

**P: ¿Los datos quedan guardados en el sistema?**  
R: Sí, todas las operaciones quedan registradas en el sistema con auditoría completa.

**P: ¿Puedo descargar las cartas de defensa en PDF?**  
R: Próximamente. Por ahora puede copiar el texto y pegarlo en Word/Google Docs para convertir a PDF.

---

## Soporte Técnico

### Canales de Soporte

**Email:** soporte@ips-erp.com  
**Teléfono:** +57 (1) 234-5678  
**Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM (Hora Colombia)  
**Respuesta:** Dentro de 24 horas hábiles

### Información para Soporte

Cuando contacte soporte, tenga a mano:

1. **Usuario:** Su correo electrónico de acceso
2. **IPS:** Nombre de su institución
3. **Hora del error:** Fecha y hora exacta
4. **Mensaje de error:** Texto completo del error
5. **Capturas de pantalla:** Si es posible
6. **Pasos para reproducir:** Qué estaba haciendo cuando ocurrió el error

### Recursos Adicionales

**Documentación Técnica:**
- API Documentation: `docs/API_DOCUMENTATION.md`
- Implementation Guide: `.kiro/steering/KIRO IMPLEMENTATION GUIDE.md`

**Videos Tutoriales:** (Próximamente)
- Cómo usar Glosa Defender
- Cómo validar archivos RIPS
- Mejores prácticas de facturación

**Actualizaciones del Sistema:**
- Revise el changelog para nuevas funcionalidades
- Suscríbase a notificaciones de actualizaciones

---

## Conclusión

Las herramientas de Glosa Defender y Validador de RIPS están diseñadas para:

✅ **Ahorrar tiempo:** Automatizar procesos que tomaban horas  
✅ **Mejorar calidad:** Generar defensas técnicas basadas en evidencia  
✅ **Reducir errores:** Validar compliance antes de radicar  
✅ **Aumentar eficiencia:** Responder glosas más rápido  
✅ **Mantener compliance:** Cumplir con Resolución 2275

**Recuerde:**
- Siempre revise el contenido generado por la IA
- Valide RIPS antes de radicar al Ministerio
- Mantenga evidencia clínica de soporte
- Contacte soporte si tiene dudas

---

**Versión del Documento:** 1.0  
**Última Actualización:** 23 de Enero, 2026  
**Próxima Revisión:** 23 de Abril, 2026

**Elaborado por:** Equipo de Desarrollo IPS ERP  
**Aprobado por:** Luis McCoy (Platform Owner)

---

*Este documento es confidencial y de uso exclusivo para administradores de IPS autorizados.*
