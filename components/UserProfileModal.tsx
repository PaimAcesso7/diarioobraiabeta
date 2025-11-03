import React, { useState, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/apiService';
import { LoadingIcon } from './icons';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onSave: (users: User[]) => Promise<void>;
    onDeleteAccount: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, currentUser, onSave, onDeleteAccount }) => {
    const [userData, setUserData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        whatsapp: currentUser.whatsapp || '',
    });
    const [password, setPassword] = useState('');
    const [confirmDelete, setConfirmDelete] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if(isOpen) {
            setUserData({
                name: currentUser.name,
                email: currentUser.email,
                whatsapp: currentUser.whatsapp || '',
            });
            setPassword('');
            setConfirmDelete('');
        }
    }, [isOpen, currentUser]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Fix: Pass 'currentUser' to fetchUsers to satisfy the function's signature.
            const allUsers = await api.fetchUsers(currentUser);
            const updatedUsers = allUsers.map(u => {
                if (u.id === currentUser.id) {
                    const updatedUser: User = { ...u, ...userData };
                    if (password) {
                        updatedUser.password = password;
                    }
                    return updatedUser;
                }
                return u;
            });
            await onSave(updatedUsers);
            alert("Perfil atualizado com sucesso!");
            onClose();
        } catch (error) {
            alert("Erro ao salvar o perfil.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = () => {
        if (confirmDelete.toLowerCase() === 'excluir') {
            if (window.confirm('Tem certeza? Esta ação é irreversível e todos os seus dados serão permanentemente apagados.')) {
                 // In a real app, this would trigger a backend process.
                 // Here we simulate it by calling the handler from App.tsx
                onDeleteAccount();
                onClose();
            }
        } else {
            alert('Por favor, digite "excluir" para confirmar.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSave} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Meu Perfil</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                    
                    <div className="space-y-4">
                        <InputField label="Nome Completo" name="name" value={userData.name} onChange={handleChange} />
                        <InputField label="E-mail" name="email" value={userData.email} onChange={handleChange} disabled />
                        <InputField label="WhatsApp" name="whatsapp" value={userData.whatsapp} onChange={handleChange} />
                        <InputField label="Nova Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
                    </div>

                    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl w-32 flex justify-center items-center">
                            {isSaving ? <LoadingIcon className="h-5 w-5"/> : 'Salvar'}
                        </button>
                    </div>
                </form>
                
                 <div className="p-6 mt-4 border-t border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-b-xl">
                    <h3 className="font-bold text-red-700 dark:text-red-300">Zona de Perigo</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">A exclusão da sua conta é permanente e removerá todos os seus dados da plataforma.</p>
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={confirmDelete}
                            onChange={(e) => setConfirmDelete(e.target.value)}
                            placeholder='Digite "excluir" para confirmar'
                            className="flex-grow px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-red-100 dark:bg-red-900/30"
                        />
                        <button type="button" onClick={handleDelete} disabled={confirmDelete.toLowerCase() !== 'excluir'} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed">
                            Excluir Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input {...props} id={props.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed" />
    </div>
);