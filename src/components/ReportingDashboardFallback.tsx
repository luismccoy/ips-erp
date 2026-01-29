import React from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';

export function ReportingDashboardFallback() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes y Análisis</h1>
          <p className="text-sm text-slate-600 mt-1">Vista general del rendimiento</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={16} />
          Exportar Todo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Visitas Completadas</p>
              <p className="text-2xl font-bold text-slate-900">127</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Reportes Generados</p>
              <p className="text-2xl font-bold text-slate-900">34</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Facturación Mes</p>
              <p className="text-2xl font-bold text-slate-900">$45.2M</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Reportes Disponibles</h2>
        <div className="space-y-2">
          {[
            { title: 'Reporte Mensual de Facturación', date: '29 Enero 2026' },
            { title: 'Análisis de Visitas Domiciliarias', date: '28 Enero 2026' },
            { title: 'Compliance Report - Res 3100', date: '27 Enero 2026' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-slate-400" />
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-slate-500">{report.date}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                Descargar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
