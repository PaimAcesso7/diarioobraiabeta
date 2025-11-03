import React, { useState, useRef } from 'react';
import { Worker } from '../types';
import { TrashIcon, PlusIcon, UsersIcon } from './icons';

interface WorkerCounterProps {
    workers: Worker[];
    setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
}

export const WorkerCounter: React.FC<WorkerCounterProps> = ({ workers, setWorkers }) => {
    const [newRole, setNewRole] = useState('');
    const [newCount, setNewCount] = useState<number | string>(1);
    const newRoleRef = useRef<HTMLInputElement>(null);
    const newCountRef = useRef<HTMLInputElement>(null);

    const handleAddNewWorker = () => {
        if (newRole.trim() === '' || Number(newCount) <= 0) {
            newRoleRef.current?.focus();
            return;
        }
        
        const newWorker: Worker = {
            id: `worker-${Date.now()}`,
            role: newRole.trim(),
            count: Number(newCount),
        };
        setWorkers(prev => [...prev, newWorker]);
        setNewRole('');
        setNewCount(1);
        newRoleRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.currentTarget.name === 'newRole' && newRole.trim() !== '') {
                newCountRef.current?.focus();
            } else {
                handleAddNewWorker();
            }
        }
    };

    const updateWorker = (id: string, field: 'role' | 'count', value: string | number) => {
        setWorkers(prev => prev.map(worker => {
            if (worker.id === id) {
                return { ...worker, [field]: value };
            }
            return worker;
        }));
    };

    const removeWorker = (id: string) => {
        setWorkers(prev => prev.filter(worker => worker.id !== id));
    };
    
    const totalWorkers = workers.reduce((sum, worker) => sum + Number(worker.count), 0);

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <UsersIcon className="h-6 w-6 text-brand-indigo" />
                    <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Colaboradores</h2>
                </div>
                <div className="flex items-center gap-4">
                     {workers.length > 0 && (
                         <button onClick={() => setWorkers([])} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold transition">
                            <TrashIcon className="h-4 w-4" />
                            Excluir Todos
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary font-semibold bg-blue-100 dark:bg-blue-900/50 rounded-full px-3 py-1 text-sm">
                        <UsersIcon className="h-5 w-5" />
                        <span>Total: {totalWorkers}</span>
                    </div>
                </div>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>

            <div className="space-y-3 mb-4">
                 {workers.length === 0 && <p className="text-gray-500 dark:text-dark-text-secondary text-center py-4">Nenhum colaborador adicionado.</p>}
                {workers.map(worker => (
                    <div key={worker.id} className="grid grid-cols-12 gap-2 items-center group">
                        <input
                            type="text"
                            placeholder="Função"
                            value={worker.role}
                            onChange={e => updateWorker(worker.id, 'role', e.target.value)}
                            className="col-span-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                        />
                        <input
                            type="number"
                            min="0"
                            value={worker.count}
                            onChange={e => updateWorker(worker.id, 'count', Number(e.target.value))}
                            className="col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                        />
                        <div className="col-span-2 flex justify-end">
                            <button onClick={() => removeWorker(worker.id)} className="text-gray-400 hover:text-red-500 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-2 pt-4 border-t border-light-bg dark:border-dark-border items-center">
                <input
                    ref={newRoleRef}
                    type="text"
                    name="newRole"
                    placeholder="Nova Função"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="col-span-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                />
                <input
                    ref={newCountRef}
                    type="number"
                    name="newCount"
                    min="1"
                    value={newCount}
                    onChange={(e) => setNewCount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                />
                <div className="col-span-2 flex justify-end">
                    <button
                        onClick={handleAddNewWorker}
                        className="bg-brand-indigo-light hover:bg-indigo-600 text-white font-bold p-2 rounded-xl transition"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};