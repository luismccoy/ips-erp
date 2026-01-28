// Basic Mock Data moved from App.tsx
import type { Tenant } from '../types';

export const TENANTS: Tenant[] = [
    { id: 'ips-vida', name: 'IPS Vida en Casa S.A.S', nit: '900.123.456-1' }
];

export const PATIENTS = [
    // Bogotá patients
    { id: 'p1', name: 'Carmen Lucía Vargas Méndez', address: 'Calle 127 #19-45, Apto 502, Barrio Cedritos, Bogotá', diagnosis: 'I10 - Hipertensión Arterial Esencial', eps: 'Sanitas', riskLevel: 'High' },
    { id: 'p2', name: 'José Antonio Ramírez Pardo', address: 'Carrera 15 #85-32, Barrio Chicó, Bogotá', diagnosis: 'E11.9 - Diabetes Mellitus Tipo 2', eps: 'Sura', riskLevel: 'Medium' },
    { id: 'p3', name: 'María Elena Castro de López', address: 'Transversal 29 #139-28, Barrio Cedritos, Bogotá', diagnosis: 'J44.1 - EPOC con Exacerbación Aguda', eps: 'Nueva EPS', riskLevel: 'High' },
    { id: 'p4', name: 'Luis Fernando Gómez Ortega', address: 'Calle 63 #9-45, Apto 301, Chapinero, Bogotá', diagnosis: 'Z96.1 - Post-operatorio Reemplazo Cadera', eps: 'Compensar', riskLevel: 'Medium' },
    { id: 'p5', name: 'Rosa Elvira Muñoz Viuda de Pérez', address: 'Carrera 68D #24-15, Barrio Modelia, Bogotá', diagnosis: 'Z51.5 - Cuidados Paliativos', eps: 'Famisanar', riskLevel: 'High' },
    { id: 'p6', name: 'Alberto Enrique Díaz Sánchez', address: 'Calle 170 #54-20, Casa 12, Barrio Toberín, Bogotá', diagnosis: 'I50.9 - Insuficiencia Cardíaca Congestiva', eps: 'Sanitas', riskLevel: 'High' },
    { id: 'p7', name: 'Gloria Patricia Hernández Vega', address: 'Avenida Calle 26 #69-76, Torre 2 Apto 1204, Bogotá', diagnosis: 'G20 - Enfermedad de Parkinson', eps: 'Sura', riskLevel: 'Medium' },
    
    // Medellín patients
    { id: 'p8', name: 'Fernando José Restrepo Uribe', address: 'Carrera 43A #14-109, El Poblado, Medellín', diagnosis: 'I25.1 - Cardiopatía Isquémica Crónica', eps: 'Coomeva', riskLevel: 'High' },
    { id: 'p9', name: 'Luz Marina Ospina de Vélez', address: 'Calle 10 #43E-25, Barrio Manila, Medellín', diagnosis: 'M81.0 - Osteoporosis con Fractura', eps: 'Sura', riskLevel: 'Medium' },
    { id: 'p10', name: 'Rodrigo Alonso Mejía Correa', address: 'Circular 76 #39B-135, Laureles, Medellín', diagnosis: 'N18.4 - Enfermedad Renal Crónica Estadio 4', eps: 'Nueva EPS', riskLevel: 'High' },
    { id: 'p11', name: 'Amparo del Socorro Giraldo Mesa', address: 'Carrera 65 #48-31, Barrio Belén, Medellín', diagnosis: 'C50.9 - Neoplasia Mama - Cuidados Paliativos', eps: 'Sanitas', riskLevel: 'High' },
    { id: 'p12', name: 'Guillermo Andrés Londoño Ríos', address: 'Calle 33 #65A-15, Conquistadores, Medellín', diagnosis: 'G30.1 - Alzheimer de Inicio Tardío', eps: 'Coomeva', riskLevel: 'Medium' },
    
    // Cali patients
    { id: 'p13', name: 'Patricia Eugenia Caicedo Lloreda', address: 'Avenida 9N #10-45, Barrio Granada, Cali', diagnosis: 'I63.9 - Secuelas de ACV Isquémico', eps: 'Comfandi', riskLevel: 'High' },
    { id: 'p14', name: 'Hernando Rafael Cruz Mosquera', address: 'Carrera 100 #11-60, Ciudad Jardín, Cali', diagnosis: 'E11.4 - Diabetes con Complicaciones Neurológicas', eps: 'Sura', riskLevel: 'Medium' },
    { id: 'p15', name: 'Esperanza Lucía Orozco de Patiño', address: 'Calle 5 #66-120, Barrio Tequendama, Cali', diagnosis: 'J96.1 - Insuficiencia Respiratoria Crónica', eps: 'Nueva EPS', riskLevel: 'High' },
    { id: 'p16', name: 'Álvaro Hernán Escobar Valencia', address: 'Avenida 3N #45-23, Versalles, Cali', diagnosis: 'Z96.64 - Post-operatorio Reemplazo Rodilla', eps: 'Comfandi', riskLevel: 'Low' },
    { id: 'p17', name: 'Cecilia Margarita Jaramillo Henao', address: 'Carrera 38 #5B-45, San Fernando, Cali', diagnosis: 'I48.9 - Fibrilación Auricular', eps: 'Coomeva', riskLevel: 'Medium' },
    
    // Additional patients
    { id: 'p18', name: 'Héctor Fabio Moreno Quintero', address: 'Calle 134 #9-65, Apto 802, Barrio Spring, Bogotá', diagnosis: 'J45.4 - Asma Severa Persistente', eps: 'Compensar', riskLevel: 'Medium' },
    { id: 'p19', name: 'Blanca Cecilia Rojas de Herrera', address: 'Transversal 39 #73-45, Barrio La Soledad, Bogotá', diagnosis: 'M06.9 - Artritis Reumatoide', eps: 'Famisanar', riskLevel: 'Low' },
    { id: 'p20', name: 'Jaime Eduardo Arias Castillo', address: 'Carrera 52 #134-20, Suba, Bogotá', diagnosis: 'Z99.3 - Dependencia de Silla de Ruedas', eps: 'Sanitas', riskLevel: 'Medium' }
];

export const NURSES = [
    // Bogotá nurses
    { id: 'n1', name: 'Sandra Milena Torres Guzmán', role: 'NURSE', locationLat: 4.6097, locationLng: -74.0817 },
    { id: 'n2', name: 'Carlos Andrés Velásquez Ruiz', role: 'NURSE', locationLat: 4.6200, locationLng: -74.0900 },
    { id: 'n3', name: 'Diana Carolina Pineda Morales', role: 'NURSE', locationLat: 4.7110, locationLng: -74.0721 },
    { id: 'n4', name: 'Jorge Ernesto Salazar Niño', role: 'NURSE', locationLat: 4.6486, locationLng: -74.1078 },
    { id: 'n5', name: 'Adriana Patricia Cárdenas Vega', role: 'NURSE', locationLat: 4.7352, locationLng: -74.0535 },
    
    // Medellín nurses
    { id: 'n6', name: 'Juliana Marcela Arango Zapata', role: 'NURSE', locationLat: 6.2442, locationLng: -75.5812 },
    { id: 'n7', name: 'Mauricio Alberto Betancur Gómez', role: 'NURSE', locationLat: 6.2518, locationLng: -75.5636 },
    { id: 'n8', name: 'Claudia Patricia Montoya Ossa', role: 'NURSE', locationLat: 6.2105, locationLng: -75.5707 },
    
    // Cali nurses  
    { id: 'n9', name: 'Andrea Fernanda Lozano Cárdenas', role: 'NURSE', locationLat: 3.4516, locationLng: -76.5320 },
    { id: 'n10', name: 'Ricardo Antonio Gutiérrez Mena', role: 'NURSE', locationLat: 3.4372, locationLng: -76.5225 }
];

export const SHIFTS = [
    // Today's shifts
    { id: 's1', patientId: 'p1', nurseId: 'n1', date: '2026-01-21', startTime: '07:00', status: 'Completed' },
    { id: 's2', patientId: 'p2', nurseId: 'n2', date: '2026-01-21', startTime: '08:00', status: 'Completed' },
    { id: 's3', patientId: 'p3', nurseId: 'n3', date: '2026-01-21', startTime: '09:00', status: 'InProgress' },
    { id: 's4', patientId: 'p4', nurseId: 'n1', date: '2026-01-21', startTime: '14:00', status: 'Pending' },
    { id: 's5', patientId: 'p5', nurseId: 'n4', date: '2026-01-21', startTime: '10:00', status: 'InProgress' },
    { id: 's6', patientId: 'p6', nurseId: 'n2', date: '2026-01-21', startTime: '15:00', status: 'Pending' },
    { id: 's7', patientId: 'p7', nurseId: 'n5', date: '2026-01-21', startTime: '11:00', status: 'Completed' },
    
    // Medellín shifts
    { id: 's8', patientId: 'p8', nurseId: 'n6', date: '2026-01-21', startTime: '07:30', status: 'Completed' },
    { id: 's9', patientId: 'p9', nurseId: 'n7', date: '2026-01-21', startTime: '09:30', status: 'InProgress' },
    { id: 's10', patientId: 'p10', nurseId: 'n8', date: '2026-01-21', startTime: '14:30', status: 'Pending' },
    { id: 's11', patientId: 'p11', nurseId: 'n6', date: '2026-01-21', startTime: '16:00', status: 'Pending' },
    { id: 's12', patientId: 'p12', nurseId: 'n7', date: '2026-01-21', startTime: '08:00', status: 'Completed' },
    
    // Cali shifts
    { id: 's13', patientId: 'p13', nurseId: 'n9', date: '2026-01-21', startTime: '08:00', status: 'InProgress' },
    { id: 's14', patientId: 'p14', nurseId: 'n10', date: '2026-01-21', startTime: '10:00', status: 'Pending' },
    { id: 's15', patientId: 'p15', nurseId: 'n9', date: '2026-01-21', startTime: '15:00', status: 'Pending' },
    { id: 's16', patientId: 'p16', nurseId: 'n10', date: '2026-01-21', startTime: '07:00', status: 'Completed' },
    { id: 's17', patientId: 'p17', nurseId: 'n9', date: '2026-01-21', startTime: '12:00', status: 'Pending' },
    
    // Bogotá additional
    { id: 's18', patientId: 'p18', nurseId: 'n3', date: '2026-01-21', startTime: '16:00', status: 'Pending' },
    { id: 's19', patientId: 'p19', nurseId: 'n4', date: '2026-01-21', startTime: '13:00', status: 'Pending' },
    { id: 's20', patientId: 'p20', nurseId: 'n5', date: '2026-01-21', startTime: '09:00', status: 'InProgress' }
];

export const INVENTORY = [
    { id: 'i1', name: 'Jeringa 5cc', quantity: 45, reorderThreshold: 20, unit: 'Unidad' },
    { id: 'i2', name: 'Guantes Nitrilo Talla M', quantity: 120, reorderThreshold: 50, unit: 'Par' },
    { id: 'i3', name: 'Gasa Estéril 10x10', quantity: 12, reorderThreshold: 30, unit: 'Paquete' },
    { id: 'i4', name: 'Alcohol 70%', quantity: 8, reorderThreshold: 10, unit: 'Litro' },
    { id: 'i5', name: 'Tensiómetro Digital', quantity: 15, reorderThreshold: 5, unit: 'Unidad' },
    { id: 'i6', name: 'Oxímetro de Pulso', quantity: 12, reorderThreshold: 5, unit: 'Unidad' },
    { id: 'i7', name: 'Glucómetro', quantity: 10, reorderThreshold: 5, unit: 'Unidad' },
    { id: 'i8', name: 'Tiras Reactivas Glucosa', quantity: 200, reorderThreshold: 100, unit: 'Unidad' },
    { id: 'i9', name: 'Catéter Venoso 22G', quantity: 50, reorderThreshold: 25, unit: 'Unidad' },
    { id: 'i10', name: 'Solución Salina 500ml', quantity: 30, reorderThreshold: 20, unit: 'Bolsa' },
    { id: 'i11', name: 'Vendaje Elástico 4"', quantity: 25, reorderThreshold: 15, unit: 'Rollo' },
    { id: 'i12', name: 'Cinta Micropore', quantity: 40, reorderThreshold: 20, unit: 'Rollo' }
];

export const VITALS_HISTORY = [
    // Carmen Lucía Vargas Méndez (p1) - Hipertensión
    { patientId: 'p1', date: '2026-01-20', sys: 145, dia: 90, spo2: 95, hr: 78, note: 'Paciente estable con medicación ajustada. Se recomienda continuar con Losartán 50mg.' },
    { patientId: 'p1', date: '2026-01-18', sys: 150, dia: 95, spo2: 94, hr: 82, note: 'Presión arterial ligeramente elevada. Se ajusta dosis de diurético.' },
    { patientId: 'p1', date: '2026-01-15', sys: 160, dia: 98, spo2: 94, hr: 85, note: 'Crisis hipertensiva leve. Paciente reporta estrés familiar.' },
    
    // José Antonio Ramírez Pardo (p2) - Diabetes
    { patientId: 'p2', date: '2026-01-20', sys: 125, dia: 80, spo2: 97, hr: 72, note: 'Glucosa en ayunas: 128 mg/dL. Control aceptable.' },
    { patientId: 'p2', date: '2026-01-18', sys: 120, dia: 78, spo2: 98, hr: 70, note: 'Glucosa en ayunas: 115 mg/dL. Buen control metabólico.' },
    { patientId: 'p2', date: '2026-01-15', sys: 130, dia: 82, spo2: 97, hr: 74, note: 'Glucosa postprandial: 165 mg/dL. Se recuerda dieta.' },
    
    // María Elena Castro de López (p3) - EPOC
    { patientId: 'p3', date: '2026-01-20', sys: 135, dia: 85, spo2: 91, hr: 88, note: 'Saturación baja. Se aumenta oxígeno a 3L/min. Paciente con disnea moderada.' },
    { patientId: 'p3', date: '2026-01-18', sys: 138, dia: 86, spo2: 89, hr: 92, note: 'Exacerbación EPOC. Se inicia nebulización con Salbutamol.' },
    { patientId: 'p3', date: '2026-01-15', sys: 130, dia: 82, spo2: 93, hr: 84, note: 'Paciente estable. Continúa con inhaladores de mantenimiento.' },
    
    // Luis Fernando Gómez Ortega (p4) - Post-operatorio cadera
    { patientId: 'p4', date: '2026-01-20', sys: 118, dia: 75, spo2: 98, hr: 68, note: 'Evolución favorable. Inicio de fisioterapia ambulatoria. Sin signos de infección.' },
    { patientId: 'p4', date: '2026-01-18', sys: 122, dia: 78, spo2: 97, hr: 72, note: 'Herida quirúrgica limpia. Retiro de grapas programado.' },
    
    // Rosa Elvira Muñoz (p5) - Cuidados paliativos
    { patientId: 'p5', date: '2026-01-20', sys: 100, dia: 60, spo2: 92, hr: 90, note: 'Paciente confortable. Control de dolor adecuado con morfina 10mg c/8h.' },
    { patientId: 'p5', date: '2026-01-18', sys: 95, dia: 58, spo2: 90, hr: 94, note: 'Aumento de dosis analgésica por dolor. Familia informada sobre pronóstico.' },
    
    // Alberto Enrique Díaz Sánchez (p6) - Insuficiencia cardíaca
    { patientId: 'p6', date: '2026-01-20', sys: 110, dia: 70, spo2: 94, hr: 75, note: 'Sin edema. Peso estable. Continúa con restricción de sodio y líquidos.' },
    { patientId: 'p6', date: '2026-01-18', sys: 115, dia: 72, spo2: 93, hr: 78, note: 'Leve edema maleolar bilateral. Se aumenta Furosemida.' },
    
    // Fernando José Restrepo Uribe (p8) - Cardiopatía isquémica
    { patientId: 'p8', date: '2026-01-20', sys: 128, dia: 78, spo2: 96, hr: 65, note: 'Sin angina. Tolera actividad física leve. Control con cardiología en 15 días.' },
    { patientId: 'p8', date: '2026-01-18', sys: 132, dia: 80, spo2: 95, hr: 68, note: 'Paciente refiere fatiga ocasional. ECG sin cambios.' },
    
    // Luz Marina Ospina de Vélez (p9) - Osteoporosis con fractura
    { patientId: 'p9', date: '2026-01-20', sys: 120, dia: 75, spo2: 97, hr: 70, note: 'Movilidad mejorada. Continúa con calcio y vitamina D. Sin dolor en reposo.' },
    
    // Rodrigo Alonso Mejía Correa (p10) - Enfermedad renal crónica
    { patientId: 'p10', date: '2026-01-20', sys: 140, dia: 88, spo2: 95, hr: 76, note: 'Creatinina: 3.2 mg/dL. Programado para evaluación de fístula AV.' },
    { patientId: 'p10', date: '2026-01-18', sys: 145, dia: 90, spo2: 94, hr: 80, note: 'Edema moderado. Se ajusta dieta proteica. Próxima diálisis: viernes.' },
    
    // Patricia Eugenia Caicedo Lloreda (p13) - Secuelas ACV
    { patientId: 'p13', date: '2026-01-20', sys: 135, dia: 82, spo2: 96, hr: 74, note: 'Progreso en terapia física. Movilidad de extremidad superior derecha mejorada.' },
    { patientId: 'p13', date: '2026-01-18', sys: 138, dia: 85, spo2: 95, hr: 76, note: 'Sin nuevos déficits neurológicos. Continúa anticoagulación con Warfarina.' },
    
    // Hernando Rafael Cruz Mosquera (p14) - Diabetes con neuropatía
    { patientId: 'p14', date: '2026-01-20', sys: 130, dia: 80, spo2: 97, hr: 72, note: 'Curación de úlcera pie derecho. Evolución favorable. HbA1c: 7.8%.' },
    { patientId: 'p14', date: '2026-01-18', sys: 128, dia: 78, spo2: 97, hr: 70, note: 'Sensibilidad disminuida en ambos pies. Se refuerza cuidado podológico.' },
    
    // Esperanza Lucía Orozco de Patiño (p15) - Insuficiencia respiratoria
    { patientId: 'p15', date: '2026-01-20', sys: 125, dia: 78, spo2: 88, hr: 85, note: 'Requiere O2 a 4L/min continuo. Se solicita gasometría de control.' },
    { patientId: 'p15', date: '2026-01-18', sys: 128, dia: 80, spo2: 86, hr: 90, note: 'Disnea de esfuerzo. Se aumenta O2 a 4L/min. Espirometría pendiente.' }
];

export function getMockDataForTenant(tenantId: string) {
    // Currently we only have one tenant in this simplified mock
    console.log('Getting mock data for tenant:', tenantId);
    return {
        patients: PATIENTS,
        shifts: SHIFTS,
        inventory: INVENTORY,
        vitals: VITALS_HISTORY
    };
}
