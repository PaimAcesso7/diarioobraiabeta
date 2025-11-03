import React from 'react';
import { User } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, UsersIcon } from './icons';

interface UserManagementViewProps {
    users: User[];
    onOpenModal: (user: User | null) => void;
    onDelete: (id: string) => void;
    currentUser: User;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ users, onOpenModal, onDelete, currentUser }) => {
    
    // Apply strict visibility rules
    const usersToDisplay = users.filter(user => {
        if (currentUser.role === 'admin') {
            return true; // Admin sees everyone
        }
        if (currentUser.role === 'gestor') {
            // Gestor sees themself or the 'campo' users they created
            return user.id === currentUser.id || user.createdBy === currentUser.id;
        }
        return false; // Campo users see no one in this view
    }).filter(user => user.role !== 'admin' || currentUser.role === 'admin'); // Final safeguard: non-admins can never see admins

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg mb-8">
            <div className="flex items-center gap-3">
                <UsersIcon className="h-6 w-6 text-brand-indigo" />
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Usuários</h2>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>

            <div className="space-y-3 mb-4">
                {usersToDisplay.length === 0 && <p className="text-gray-500 dark:text-dark-text-secondary text-center py-2">Nenhum usuário para exibir.</p>}
                {usersToDisplay.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl group">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-dark-text-primary">{user.name} {user.id === currentUser.id && '(Você)'}</p>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{user.email}</p>
                        </div>
                        <div className="flex items-center">
                            <button onClick={() => onOpenModal(user)} className="text-gray-400 hover:text-blue-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => onDelete(user.id)} className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" disabled={user.role === 'admin'}>
                                <TrashIcon className={`h-5 w-5 ${user.role === 'admin' ? 'text-gray-300' : ''}`} />
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
                    {currentUser.role === 'gestor' ? 'Adicionar Usuário de Campo' : 'Adicionar Usuário'}
                </button>
            </div>
        </div>
    );
};
