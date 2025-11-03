import React, { useState, useEffect } from 'react';
import { User, Project } from '../types';
import { BuildingOfficeIcon } from './icons';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'>) => void;
    userToEdit: User | null;
    currentUser: User;
    projects: Project[];
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit, currentUser, projects }) => {
    const [userData, setUserData] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');
    const [assignedProjectIds, setAssignedProjectIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Security check: a non-admin cannot edit an admin. Close modal if attempted.
        if (isOpen && userToEdit?.role === 'admin' && currentUser.role !== 'admin') {
            onClose();
            return;
        }

        if (userToEdit) {
            setUserData({
                name: userToEdit.name,
                email: userToEdit.email,
                whatsapp: userToEdit.whatsapp || '',
                role: userToEdit.role,
                createdBy: userToEdit.createdBy,
                accessLevel: userToEdit.accessLevel,
                trialEndsAt: userToEdit.trialEndsAt,
                assignedProjectIds: userToEdit.assignedProjectIds || []
            });
            setAssignedProjectIds(new Set(userToEdit.assignedProjectIds || []));
            setPassword('');
        } else {
            const defaultRole = currentUser.role === 'admin' ? 'gestor' : 'campo';
            setUserData({
                name: '', email: '', whatsapp: '',
                role: defaultRole,
                accessLevel: 'trial', trialEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                createdBy: currentUser.role === 'gestor' ? currentUser.id : undefined,
                assignedProjectIds: []
            });
            setAssignedProjectIds(new Set());
            setPassword('');
        }
    }, [userToEdit, isOpen, currentUser, onClose]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignProject = (projectId: string) => {
        setAssignedProjectIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUserData: Partial<User> = { ...userData };

        if (password) {
            finalUserData.password = password;
        }
        
        if (finalUserData.role === 'campo') {
            finalUserData.assignedProjectIds = Array.from(assignedProjectIds);
        } else {
            delete finalUserData.assignedProjectIds;
        }

        if (!userToEdit && currentUser.role === 'gestor') {
            finalUserData.role = 'campo';
            finalUserData.createdBy = currentUser.id;
        }
        onSave(finalUserData as Omit<User, 'id'>);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{userToEdit ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>

                    <InputField label="Nome" name="name" value={userData.name || ''} onChange={handleChange} required />
                    <InputField label="Email" name="email" type="email" value={userData.email || ''} onChange={handleChange} required />
                    <InputField label="WhatsApp" name="whatsapp" value={userData.whatsapp || ''} onChange={handleChange} />
                    <InputField label="Senha" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!userToEdit} placeholder={userToEdit ? 'Deixe em branco para não alterar' : ''} />

                    {currentUser.role === 'admin' && (
                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Perfil</label>
                            <select id="role" name="role" value={userData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary">
                                <option value="gestor">Gestor</option>
                                <option value="campo">Campo</option>
                            </select>
                        </div>
                    )}

                    {userData.role === 'campo' && (
                        <div className="mt-6 pt-4 border-t dark:border-dark-border">
                            <label className="block text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                                <BuildingOfficeIcon className="h-6 w-6"/>
                                Atribuir Obras
                            </label>
                            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                {projects.filter(p => p.status === 'active').length > 0 ? 
                                    projects.filter(p => p.status === 'active').map(project => (
                                        <div key={project.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`project-${project.id}`}
                                                checked={assignedProjectIds.has(project.id)}
                                                onChange={() => handleAssignProject(project.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-indigo focus:ring-brand-indigo"
                                            />
                                            <label htmlFor={`project-${project.id}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                                                {project.name}
                                            </label>
                                        </div>
                                    )) : <p className="text-sm text-center text-gray-500 dark:text-dark-text-secondary">Nenhuma obra ativa para atribuir.</p>
                                }
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Cancelar</button>
                        <button type="submit" className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="mb-4">
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input {...props} id={props.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600" />
    </div>
);
