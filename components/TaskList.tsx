import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { TrashIcon, PlusIcon, CheckCircleIcon } from './icons';

interface TaskListProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    taskHistory: Task[];
    onAddTask: (taskText: string, location: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, taskHistory, onAddTask }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const newTaskTextRef = useRef<HTMLInputElement>(null);

    const handleAddTaskClick = () => {
        if (newTaskText.trim() === '') {
            newTaskTextRef.current?.focus();
            return;
        }
        onAddTask(newTaskText, newLocation);
        setNewTaskText('');
        setNewLocation('');
        newTaskTextRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.currentTarget.name === 'newTaskText' && newTaskText.trim() !== '') {
                document.getElementsByName('newLocation')?.[0]?.focus();
            } else {
                handleAddTaskClick();
            }
        }
    };

    const updateTask = (id: string, field: 'text' | 'location', value: string) => {
        setTasks(prev => prev.map(task => (task.id === id ? { ...task, [field]: value } : task)));
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Atividades Realizadas</h2>
                </div>
                {tasks.length > 0 && (
                     <button onClick={() => setTasks([])} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold transition">
                        <TrashIcon className="h-4 w-4" />
                        Excluir Todas
                    </button>
                )}
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>
            
            <div className="space-y-3 mb-4">
                {tasks.length === 0 && <p className="text-gray-500 dark:text-dark-text-secondary text-center py-4">Nenhuma tarefa adicionada. Use a IA ou adicione manualmente.</p>}
                {tasks.map(task => (
                    <div key={task.id} className="grid grid-cols-12 gap-2 items-center group">
                        <input
                            type="text"
                            placeholder="Atividade realizada"
                            value={task.text}
                            onChange={e => updateTask(task.id, 'text', e.target.value)}
                            className="col-span-12 sm:col-span-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                            list="task-history"
                        />
                         <datalist id="task-history">
                            {taskHistory.map((task, index) => (
                                <option key={index} value={task.text} />
                            ))}
                        </datalist>
                         <input
                            type="text"
                            placeholder="Local (Ex: Térreo)"
                            value={task.location || ''}
                            onChange={e => updateTask(task.id, 'location', e.target.value)}
                            className="col-span-12 sm:col-span-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                        />
                        <div className="col-span-12 sm:col-span-1 flex justify-end">
                            <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-2 pt-4 border-t border-light-bg dark:border-dark-border items-start">
                <div className="col-span-12 sm:col-span-7">
                    <input
                        ref={newTaskTextRef}
                        type="text"
                        name="newTaskText"
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Adicionar nova atividade realizada"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                        list="task-history"
                    />
                    <datalist id="task-history">
                        {taskHistory.map((task, index) => (
                            <option key={index} value={task.text} />
                        ))}
                    </datalist>
                </div>
                <div className="col-span-12 sm:col-span-4">
                     <input
                        type="text"
                        name="newLocation"
                        value={newLocation}
                        onChange={e => setNewLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Local"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                    />
                </div>
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                    <button
                        onClick={handleAddTaskClick}
                        className="bg-brand-indigo-light hover:bg-indigo-600 text-white font-bold p-2 rounded-xl transition w-full sm:w-auto"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};