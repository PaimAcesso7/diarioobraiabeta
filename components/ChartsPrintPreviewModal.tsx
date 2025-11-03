import React from 'react';
import ReactDOM from 'react-dom';
import { Project, Constructor, PlatformSettings } from '../types';
import { PrinterIcon } from './icons';
import { AppLogo } from './AppLogo';
import { BarChart } from './BarChart';
import { StackedBarChart } from './StackedBarChart';

interface PrintableChartsViewProps {
    project: Project;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
    formattedChartData: any;
}

const PrintableChartsView: React.FC<PrintableChartsViewProps> = ({ project, constructors, platformSettings, formattedChartData }) => {
    const constructor = constructors.find(c => c.id === project.constructorId);
    return (
        <div className="bg-white text-gray-800 p-8 font-sans text-sm">
             <header className="flex justify-between items-start pb-4 mb-6 border-b-2 border-gray-300">
                <div className="text-left">
                    {platformSettings?.logo && <AppLogo logoSrc={platformSettings.logo} className="h-10 w-auto mb-2" />}
                    <h1 className="text-xl font-bold text-gray-800">{platformSettings?.name}</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-bold">{project.name}</h2>
                    <p className="text-sm text-gray-600">{constructor?.name || 'Construtora não especificada'}</p>
                    <p className="text-xs text-gray-500 mt-1">Relatório Gráfico Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </header>
            <div className="space-y-10">
                <div>
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary print:text-black mb-4">
                        Histograma de Colaboradores (Homem x Dia)
                    </h3>
                    <StackedBarChart
                        series={formattedChartData.workerSeries}
                        data={formattedChartData.workerData}
                    />
                </div>
                <div className="print-page-break">
                    <BarChart 
                        title="Atividades Realizadas" 
                        data={formattedChartData.tasks}
                        barColorClass="bg-green-500"
                    />
                </div>
                 <div className="mt-10">
                    <BarChart 
                        title="Atividades Impossibilitadas" 
                        data={formattedChartData.blocked}
                        barColorClass="bg-red-500"
                    />
                 </div>
                 <div className="mt-10">
                    <BarChart 
                        title="Dias de Chuva" 
                        data={formattedChartData.rainyDays}
                        barColorClass="bg-blue-500"
                    />
                 </div>
            </div>
        </div>
    );
};


interface ChartsPrintPreviewModalProps {
    onClose: () => void;
    project: Project;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
    formattedChartData: any;
}

export const ChartsPrintPreviewModal: React.FC<ChartsPrintPreviewModalProps> = (props) => {
    const { onClose } = props;
    
    const handlePrint = () => {
        document.body.classList.add('print-active');

        const handleAfterPrint = () => {
            document.body.classList.remove('print-active');
            window.removeEventListener('afterprint', handleAfterPrint);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        
        // Timeout ensures styles are applied before print dialog opens
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const PrintPortal = () => {
        return ReactDOM.createPortal(
            <div className="printable-portal">
                <PrintableChartsView {...props} />
            </div>,
            document.body
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 print:hidden">
                <div className="bg-gray-200 dark:bg-dark-border rounded-xl shadow-xl w-full max-w-4xl h-[95vh] flex flex-col">
                    <div className="p-4 bg-light-card dark:bg-dark-card rounded-t-xl flex justify-between items-center border-b dark:border-dark-border">
                        <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Pré-visualização de Impressão</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="flex-grow overflow-auto p-8 bg-gray-500 dark:bg-dark-bg">
                        <div className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl origin-top">
                            <PrintableChartsView {...props} />
                        </div>
                    </div>
                    <div className="p-4 bg-light-card dark:bg-dark-card rounded-b-xl flex justify-end gap-4 border-t dark:border-dark-border">
                        <button onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Fechar</button>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition">
                            <PrinterIcon className="h-5 w-5" />
                            Imprimir
                        </button>
                    </div>
                </div>
            </div>
            
            <PrintPortal />
        </>
    );
};
