import React, { useState, useEffect, useMemo } from 'react';
import { Project, LogData, Task, Worker, Constructor, PlatformSettings } from '../types';
import { LoadingIcon, ChartBarIcon, PrinterIcon } from './icons';
import { BarChart } from './BarChart';
import { StackedBarChart } from './StackedBarChart';

interface ProjectChartsModalProps {
    project: Project;
    onClose: () => void;
    onPrint: (formattedData: any) => void;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
}

interface ChartDataEntry {
    tasks: number;
    blocked: number;
    rainyDays: number;
    workers: Record<string, number>;
}

type ChartDataMap = Record<string, ChartDataEntry>;

const processLogsForCharts = (projectId: string, period: 'month' | 'day') => {
    const dataMap: ChartDataMap = {};
    const logsToProcess: {dateStr: string, logData: LogData, tasks: Task[], impossible: Task[], workers: Worker[]}[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`logData-${projectId}-`) && key.endsWith('-info')) {
             try {
                const dateStr = key.substring(projectId.length + 9, key.length - 5);
                const logData: LogData = JSON.parse(localStorage.getItem(key) || '{}');
                const logTasks: Task[] = JSON.parse(localStorage.getItem(`logData-${projectId}-${dateStr}-tasks`) || '[]');
                const logImpossible: Task[] = JSON.parse(localStorage.getItem(`logData-${projectId}-${dateStr}-impossible`) || '[]');
                const logWorkers: Worker[] = JSON.parse(localStorage.getItem(`logData-${projectId}-${dateStr}-workers`) || '[]');
                logsToProcess.push({dateStr, logData, tasks: logTasks, impossible: logImpossible, workers: logWorkers});
             } catch(e) {
                 console.error(`Error processing log key ${key}:`, e);
             }
        }
    }
    
    // Sort logs by date to process them chronologically
    logsToProcess.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    const finalLogs = period === 'day' ? logsToProcess.slice(-30) : logsToProcess;

    finalLogs.forEach(({ dateStr, logData, tasks, impossible, workers }) => {
        const logDate = new Date(dateStr + 'T00:00:00');
        let dataKey: string;
        if(period === 'month') {
            dataKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
            dataKey = dateStr;
        }

        if (!dataMap[dataKey]) {
            dataMap[dataKey] = { tasks: 0, blocked: 0, rainyDays: 0, workers: {} };
        }

        dataMap[dataKey].tasks += tasks.length;
        dataMap[dataKey].blocked += impossible.length;
        if (logData.weather === 'Chuvoso') {
            dataMap[dataKey].rainyDays += 1;
        }
        
        workers.forEach(worker => {
            const role = worker.role.trim();
            if (role) {
                dataMap[dataKey].workers[role] = (dataMap[dataKey].workers[role] || 0) + Number(worker.count);
            }
        });
    });

    return dataMap;
};

export const ProjectChartsModal: React.FC<ProjectChartsModalProps> = ({ project, onClose, onPrint, constructors, platformSettings }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartDataMap>({});
    const [period, setPeriod] = useState<'month' | 'day'>('month');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const data = processLogsForCharts(project.id, period);
            setChartData(data);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [project.id, period]);
    
    const formattedChartData = useMemo(() => {
        const sortedKeys = Object.keys(chartData).sort((a, b) => a.localeCompare(b));
        
        const formatLabel = (key: string) => {
            if (period === 'month') {
                const [year, month] = key.split('-');
                const date = new Date(Number(year), Number(month) - 1);
                return date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
            }
            const date = new Date(key + 'T00:00:00');
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        };
        
        const allRoles = new Set<string>();
        sortedKeys.forEach(key => {
            Object.keys(chartData[key].workers).forEach(role => allRoles.add(role));
        });

        const roleColors = [
            'bg-sky-500', 'bg-teal-500', 'bg-emerald-500', 'bg-lime-500',
            'bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-fuchsia-500',
            'bg-violet-500', 'bg-indigo-500'
        ];
        
        const workerSeries = Array.from(allRoles).sort().map((role, index) => ({
            name: role,
            colorClass: roleColors[index % roleColors.length],
        }));

        const workerData = sortedKeys.map(key => ({
            label: formatLabel(key),
            values: chartData[key].workers
        }));

        return {
            tasks: sortedKeys.map(key => ({ label: formatLabel(key), value: chartData[key].tasks })),
            blocked: sortedKeys.map(key => ({ label: formatLabel(key), value: chartData[key].blocked })),
            rainyDays: sortedKeys.map(key => ({ label: formatLabel(key), value: chartData[key].rainyDays })),
            workerData,
            workerSeries,
        };
    }, [chartData, period]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
                <div className="p-6 border-b dark:border-dark-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                                <ChartBarIcon className="h-6 w-6 text-brand-indigo"/>
                                Análise Gráfica da Obra
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Projeto: {project.name}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingIcon className="h-12 w-12 text-brand-indigo animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-0">
                                        Histograma de Colaboradores (Homem x Dia)
                                    </h3>
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-border p-1 rounded-lg">
                                        <button onClick={() => setPeriod('day')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${period === 'day' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}>
                                            Dia
                                        </button>
                                        <button onClick={() => setPeriod('month')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${period === 'month' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}>
                                            Mês
                                        </button>
                                    </div>
                                </div>
                                <StackedBarChart
                                    series={formattedChartData.workerSeries}
                                    data={formattedChartData.workerData}
                                />
                            </div>
                            <BarChart 
                                title="Atividades Realizadas por Mês" 
                                data={formattedChartData.tasks}
                                barColorClass="bg-green-500"
                            />
                            <BarChart 
                                title="Atividades Impossibilitadas por Mês" 
                                data={formattedChartData.blocked}
                                barColorClass="bg-red-500"
                            />
                            <BarChart 
                                title="Dias de Chuva por Mês" 
                                data={formattedChartData.rainyDays}
                                barColorClass="bg-blue-500"
                            />
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-light-card dark:bg-dark-card rounded-b-xl flex justify-end gap-4 border-t dark:border-dark-border">
                    <button onClick={() => onPrint(formattedChartData)} className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition">
                        <PrinterIcon className="h-5 w-5" />
                        Imprimir Gráficos
                    </button>
                    <button onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Fechar</button>
                </div>
            </div>
        </div>
    );
};