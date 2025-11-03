import React from 'react';

interface StackedChartSeries {
    name: string;
    colorClass: string;
}

interface StackedChartData {
    label: string;
    values: Record<string, number>; // keys match series names
}

interface StackedBarChartProps {
    series: StackedChartSeries[];
    data: StackedChartData[];
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ series, data }) => {
    const maxValue = React.useMemo(() => {
        if (data.length === 0) return 10;
        const max = Math.max(...data.map(d => Object.values(d.values).reduce((sum, val) => sum + Number(val), 0)));
        return max > 0 ? Math.ceil(max / 5) * 5 + 5 : 10;
    }, [data]);

    if (data.length === 0 || series.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center text-gray-500 dark:text-dark-text-secondary h-80 flex items-center justify-center">
                Nenhum dado de colaborador disponível para este período.
            </div>
        );
    }

    const yAxisLabels = Array.from({ length: 6 }, (_, i) => Math.round(maxValue * (i / 5)));


    return (
        <div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs print:hidden">
                {series.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${s.colorClass}`}></div>
                        <span className="text-gray-600 dark:text-dark-text-secondary">{s.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between h-80 text-right text-xs text-gray-500 dark:text-dark-text-secondary print:text-black py-3">
                    {yAxisLabels.slice().reverse().map(label => <div key={label}>{label}</div>)}
                </div>

                {/* Chart Area */}
                <div className="flex-grow grid grid-cols-1">
                    <div className="relative h-80">
                         {/* Y-Axis Grid Lines */}
                        {yAxisLabels.map((label, index) => (
                           <div key={label} className="absolute w-full border-t border-gray-200 dark:border-gray-700/50 print:border-gray-300" style={{ bottom: `${(index / (yAxisLabels.length -1)) * 100}%`}}></div>
                        ))}
                         {/* Bars */}
                        <div className="absolute inset-0 flex justify-around items-end gap-2 sm:gap-4 px-2">
                             {data.map(item => {
                                const totalValue = Object.values(item.values).reduce((sum, val) => sum + Number(val), 0);

                                return (
                                    <div key={item.label} className="flex-1 flex flex-col items-center group relative h-full">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 print:hidden">
                                            <div className="font-bold mb-1 border-b border-gray-700 pb-1">{item.label}</div>
                                            <ul className="mt-1">
                                                {series.map(s => {
                                                    const value = Number(item.values[s.name] || 0);
                                                    if (value > 0) return <li key={s.name} className="flex justify-between gap-2"><span>{s.name}:</span> <span className="font-bold">{value}</span></li>;
                                                    return null;
                                                })}
                                            </ul>
                                            {totalValue > 0 && <div className="font-bold mt-1 border-t border-gray-700 pt-1">Total: {totalValue}</div>}
                                        </div>
                                        
                                        <div 
                                            className="w-4 sm:w-6 md:w-8 flex flex-col-reverse rounded-t-md overflow-hidden bg-gray-200 dark:bg-gray-700/50 transition-all duration-300 mt-auto"
                                            style={{ height: totalValue > 0 ? `${(totalValue / maxValue) * 100}%` : '0%' }}
                                        >
                                            {series.map(s => {
                                                const value = Number(item.values[s.name] || 0);
                                                if (value === 0) return null;

                                                const percentageOfTotal = totalValue > 0 ? (value / totalValue) * 100 : 0;
                                                
                                                const barHeightPx = (totalValue / maxValue) * 320; // h-80 = 20rem = 320px
                                                const segmentHeightPx = (percentageOfTotal / 100) * barHeightPx;

                                                return (
                                                    <div
                                                        key={s.name}
                                                        className={`${s.colorClass} transition-all duration-200 flex items-center justify-center overflow-hidden print:color-adjust-exact`}
                                                        style={{ height: `${percentageOfTotal}%` }}
                                                    >
                                                        {segmentHeightPx > 14 && (
                                                            <span className="text-white print:text-black text-[10px] font-bold" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
                                                                {value}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                         <div className="text-xs text-center text-gray-500 dark:text-dark-text-secondary print:text-black mt-2 h-8 transform -rotate-45 sm:rotate-0 origin-center">{item.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};