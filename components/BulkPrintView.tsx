import React, { useMemo } from 'react';
import { Project, Constructor, LogData, Task, Worker, ImageFile, PlatformSettings, FullLog } from '../types';
import { PrintableView } from './PrintableView';
import { PrinterIcon } from './icons';

interface BulkPrintViewProps {
    project: Project;
    dates: string[];
    constructors: Constructor[];
    platformSettings: PlatformSettings;
}

export const BulkPrintView: React.FC<BulkPrintViewProps> = ({ project, dates, constructors, platformSettings }) => {

    const logsToPrint = useMemo<(FullLog & { project: Project })[]>(() => {
        const logs: (FullLog & { project: Project })[] = [];

        for (const dateStr of dates) {
            try {
                const logKey = `logData-${project.id}-${dateStr}`;
                const logDataString = localStorage.getItem(`${logKey}-info`);
                if (!logDataString) continue;

                const logData: LogData = JSON.parse(logDataString);
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

                logs.push({ logData, tasks, impossibleTasks, workers, constructor, elapsedDays, images, platformSettings, project });
            } catch (e) {
                console.error(`Failed to parse log for date ${dateStr}:`, e);
            }
        }
        return logs.sort((a, b) => new Date(a.logData.date).getTime() - new Date(b.logData.date).getTime());
    }, [project, dates, constructors, platformSettings]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg print:hidden mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Impressão em Massa - {project.name}</h2>
                        <p className="text-lg text-gray-600 dark:text-dark-text-secondary">Imprimindo {logsToPrint.length} relatório(s) selecionado(s).</p>
                    </div>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition w-full sm:w-auto">
                        <PrinterIcon className="h-5 w-5" />
                        Imprimir Relatórios
                    </button>
                </div>
                 {logsToPrint.length > 0 && (
                     <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-dark-text-secondary">
                        <p>Abaixo está a pré-visualização dos relatórios. Role para baixo para ver todos. Quando estiver pronto, clique em "Imprimir Relatórios".</p>
                     </div>
                )}
            </div>
            
            {logsToPrint.length === 0 ? (
                 <p className="text-center text-gray-500 dark:text-dark-text-secondary py-10 print:hidden">Nenhum relatório válido encontrado para as datas selecionadas.</p>
            ) : (
                <div className="bg-gray-400 dark:bg-dark-bg p-4 sm:p-8 print:p-0 print:bg-transparent">
                     {logsToPrint.map((log, index) => (
                        <div key={index} className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl mb-8 print:shadow-none print:mb-0 print-page-break">
                            <PrintableView {...log} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};