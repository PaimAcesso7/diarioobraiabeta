import React from 'react';
import { Constructor } from '../types';
import { PlusIcon, TrashIcon, BuildingOfficeIcon, PencilIcon } from './icons';

interface ConstructorManagerProps {
    constructors: Constructor[];
    onOpenModal: (constructor: Constructor | null) => void;
    onDelete: (id: string) => void;
}

export const ConstructorManager: React.FC<ConstructorManagerProps> = ({ constructors, onOpenModal, onDelete }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg mb-8">
            <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-6 w-6 text-brand-indigo" />
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Construtoras</h2>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>

            <div className="space-y-3 mb-4">
                {constructors.length === 0 && <p className="text-gray-500 dark:text-dark-text-secondary text-center py-2">Nenhuma construtora cadastrada.</p>}
                {constructors.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl group">
                        <div className="flex items-center gap-4">
                            {c.logo ? (
                                <img src={c.logo} alt={c.name} className="h-14 w-14 object-contain rounded-md bg-white dark:bg-gray-700 p-1 shadow-sm" />
                            ) : (
                                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                            <span className="text-gray-800 dark:text-dark-text-primary font-bold text-lg">{c.name}</span>
                        </div>
                        <div className="flex items-center">
                             <button onClick={() => onOpenModal(c)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => onDelete(c.id)} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="pt-4 border-t border-light-bg dark:border-dark-border flex justify-center">
                <button
                    onClick={() => onOpenModal(null)}
                    className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold py-2 px-4 rounded-xl transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    Adicionar Construtora
                </button>
            </div>
        </div>
    );
};