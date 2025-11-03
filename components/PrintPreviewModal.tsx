import React, { useRef } from 'react';
// Fix: Import PrintableViewProps from ../types, as it's not exported from PrintableView.
import { PrintableView } from './PrintableView';
import { PrintableViewProps } from '../types';
import { PrinterIcon } from './icons';

export const PrintPreviewModal: React.FC<PrintableViewProps & { isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose, ...props }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 print:hidden">
            <div className="bg-gray-200 dark:bg-dark-border rounded-xl shadow-xl w-full max-w-4xl h-[95vh] flex flex-col">
                <div className="p-4 bg-light-card dark:bg-dark-card rounded-t-xl flex justify-between items-center border-b dark:border-dark-border">
                    <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Pré-visualização de Impressão</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-grow overflow-auto p-8 bg-gray-500 dark:bg-dark-bg">
                     <div id="printable-area" className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl origin-top">
                        <PrintableView {...props} />
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
            
            <div className="hidden print:block">
                 <PrintableView {...props} />
            </div>
        </div>
    );
};