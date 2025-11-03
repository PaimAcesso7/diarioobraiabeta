import React from 'react';
import { PencilSquareIcon } from './icons';

interface ObservationsProps {
    observations: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Observations: React.FC<ObservationsProps> = ({ observations, onChange }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
                <PencilSquareIcon className="h-6 w-6 text-brand-indigo" />
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Observações</h2>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>
            <textarea
                name="observations"
                value={observations || ''}
                onChange={onChange}
                placeholder="Adicione notas, observações ou ocorrências relevantes do dia..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
            />
        </div>
    );
};