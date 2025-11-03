import React from 'react';

interface ChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    title: string;
    data: ChartData[];
    barColorClass: string;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, barColorClass }) => {
    const maxValue = React.useMemo(() => {
        if (data.length === 0) return 1;
        const max = Math.max(...data.map(d => d.value));
        // Return a slightly higher value to avoid the bar taking 100% width, or a default if max is 0
        return max > 0 ? Math.ceil(max * 1.1) : 1;
    }, [data]);

    if (data.length === 0) {
        return (
            <div>
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary print:text-black mb-2">{title}</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center text-gray-500 dark:text-dark-text-secondary">
                    Nenhum dado disponível para este período.
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary print:text-black mb-2">{title}</h3>
            <div className="space-y-3 p-2">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-4 items-center gap-2 text-sm">
                        <div className="col-span-1 text-right font-medium text-gray-600 dark:text-dark-text-secondary print:text-black pr-2 truncate">
                            {item.label}
                        </div>
                        <div className="col-span-3 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                            <div
                                className={`${barColorClass} h-6 rounded-full flex items-center justify-start px-3 transition-all duration-500 ease-out print:color-adjust-exact`}
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className="font-bold text-white print:text-black text-shadow-sm">
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};