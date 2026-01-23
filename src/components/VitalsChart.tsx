import React from 'react';

interface VitalsDataPoint {
    date: string;
    sys: number;
    dia: number;
}

interface VitalsChartProps {
    data: VitalsDataPoint[];
}

export const VitalsChart: React.FC<VitalsChartProps> = ({ data }) => {
    if (!data || data.length < 2) {
        return (
            <div className="h-40 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-xs text-slate-400 font-medium">Insuficientes datos para gráfica</p>
            </div>
        );
    }

    // Sort by date ascending
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Dimensions
    const width = 100; // viewbox units
    const height = 50; // viewbox units
    const padding = 5;

    // Scales
    const maxVal = Math.max(...sortedData.map(d => Math.max(d.sys, d.dia))) + 10;
    const minVal = Math.min(...sortedData.map(d => Math.min(d.sys, d.dia))) - 10;
    const range = maxVal - minVal;

    const getX = (index: number) => padding + (index / (sortedData.length - 1)) * (width - 2 * padding);
    const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

    // Generate Paths
    const sysPath = sortedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.sys)}`).join(' ');
    const diaPath = sortedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.dia)}`).join(' ');

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Guidelines */}
                <line x1={padding} y1={getY(120)} x2={width - padding} y2={getY(120)} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                <line x1={padding} y1={getY(80)} x2={width - padding} y2={getY(80)} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />

                {/* Lines */}
                <path d={sysPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={diaPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {sortedData.map((d, i) => (
                    <g key={i}>
                        <circle cx={getX(i)} cy={getY(d.sys)} r="1.5" fill="white" stroke="#ef4444" strokeWidth="0.5" />
                        <circle cx={getX(i)} cy={getY(d.dia)} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="0.5" />
                    </g>
                ))}
            </svg>
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] text-slate-400">{new Date(sortedData[0].date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</span>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[10px] text-slate-500 font-medium">Sistólica</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] text-slate-500 font-medium">Diastólica</span>
                    </div>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(sortedData[sortedData.length - 1].date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</span>
            </div>
        </div>
    );
};
