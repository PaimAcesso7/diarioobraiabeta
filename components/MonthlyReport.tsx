import React, { useMemo, useRef } from 'react';
import { Project, Constructor, LogData, Task, Worker, ImageFile, PlatformSettings } from '../types';
import { PrintableView } from './PrintableView';
import { PrinterIcon } from './icons';

interface MonthlyReportProps {
    project: Project;
    month: Date;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
}

interface FullLog {
    logData: LogData;
    tasks: Task[];
    impossibleTasks: Task[];
    workers: Worker[];
    images: ImageFile[];
    constructor?: Constructor;
    elapsedDays?: number | null;
    platformSettings: PlatformSettings;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ project, month, constructors, platformSettings }) => {

    const monthlyLogs = useMemo<FullLog[]>(() => {
        const logs: FullLog[] = [];
        const year = month.getFullYear();
        const monthIndex = month.getMonth();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`logData-${project.id}-`) && key.endsWith('-info')) {
                const dateStr = key.substring(project.id.length + 9, key.length - 5);
                const logDate = new Date(dateStr + 'T00:00:00');

                if (logDate.getFullYear() === year && logDate.getMonth() === monthIndex) {
                    try {
                        const logKey = `logData-${project.id}-${dateStr}`;
                        const logData: LogData = JSON.parse(localStorage.getItem(`${logKey}-info`) || '{}');
                        const tasks: Task[] = JSON.parse(localStorage.getItem(`${logKey}-tasks`) || '[]');
                        const impossibleTasks: Task[] = JSON.parse(localStorage.getItem(`${logKey}-impossible`) || '[]');
                        const workers: Worker[] = JSON.parse(localStorage.getItem(`${logKey}-workers`) || '[]');
                        const images: ImageFile[] = JSON.parse(localStorage.getItem(`${logKey}-images`) || '[]');
                        const constructor = constructors.find(c => c.id === project.constructorId);
                        
                        const elapsedDays = project.startDate ? (() => {
                            const start = new Date(project.startDate + 'T00:00:00');
                            const current = new Date(dateStr + 'T00:00:00');
                            if (current < start) return 0;
                            const diffTime = Math.abs(current.getTime() - start.getTime());
                            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        })() : null;

                        logs.push({ logData, tasks, impossibleTasks, workers, constructor, elapsedDays, images, platformSettings });
                    } catch (e) {
                        console.error(`Failed to parse log for date ${dateStr}:`, e);
                    }
                }
            }
        }
        return logs.sort((a, b) => new Date(a.logData.date).getTime() - new Date(b.logData.date).getTime());
    }, [project, month, constructors, platformSettings]);

    const handlePrint = () => {
        window.print();
    };
    
    const monthName = month.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Relatório Mensal - {project.name}</h2>
                        <p className="text-lg text-gray-600 dark:text-dark-text-secondary capitalize">{monthName}</p>
                    </div>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        <PrinterIcon className="h-5 w-5" />
                        Imprimir Relatório
                    </button>
                </div>
                
                {monthlyLogs.length === 0 ? (
                     <p className="text-center text-gray-500 dark:text-dark-text-secondary py-10">Nenhum relatório encontrado para este mês.</p>
                ) : (
                 <div className="prose dark:prose-invert prose-lg max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Pré-visualização do Relatório</h3>
                    <p>Este relatório consolidado contém <strong>{monthlyLogs.length} diário(s) de obra</strong> para o mês de {monthName}. Clique em "Imprimir Relatório" para gerar o PDF. Cada diário será impresso em uma ou mais páginas, dependendo do conteúdo.</p>
                 </div>
                )}
            </div>
            <div className="hidden print:block">
                {monthlyLogs.map((log, index) => (
                    <div key={index} className="print-page-break">
                        <PrintableView {...log} project={project} />
                    </div>
                ))}
            </div>
        </div>
    );
};