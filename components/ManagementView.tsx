import React, { useState } from 'react';
import { Project, Constructor, User } from '../types';
import { ProjectModal } from './ProjectModal';
import { ConstructorModal } from './ConstructorModal';
import { UserModal } from './UserModal';
import { ConstructorManager } from './ConstructorManager';
import { UserManagementView } from './UserManagementView';
import { PlusIcon, BuildingOfficeIcon, UsersIcon, PencilSquareIcon, DocumentTextIcon } from './icons';
import * as api from '../services/apiService';

interface ManagementViewProps {
    projects: Project[];
    saveProjects: (projects: Project[]) => Promise<void>;
    constructors: Constructor[];
    saveConstructors: (constructors: Constructor[]) => Promise<void>;
    allUsers: User[];
    saveUsers: (users: User[]) => Promise<void>;
    currentUser: User;
}

const ProjectManager: React.FC<{
    projects: Project[];
    onOpenModal: (project: Project | null) => void;
}> = ({ projects, onOpenModal }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg mb-8">
            <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-6 w-6 text-brand-indigo" />
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Obras</h2>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>

            <div className="space-y-3 mb-4">
                {projects.length === 0 && <p className="text-gray-500 dark:text-dark-text-secondary text-center py-2">Nenhuma obra cadastrada.</p>}
                {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl group">
                        <div className="flex items-center gap-4">
                            {project.logo ? (
                                <img src={project.logo} alt={project.name} className="h-14 w-14 object-cover rounded-md bg-white p-1 shadow-sm" />
                            ) : (
                                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-gray-800 dark:text-dark-text-primary">{project.name}</p>
                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{project.address}</p>
                            </div>
                        </div>
                        <button onClick={() => onOpenModal(project)} className="text-gray-400 hover:text-blue-500 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="pt-4 border-t border-light-bg dark:border-dark-border flex justify-center">
                <button
                    onClick={() => onOpenModal(null)}
                    className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold py-2 px-4 rounded-xl transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    Adicionar Nova Obra
                </button>
            </div>
        </div>
    );
};

export const ManagementView: React.FC<ManagementViewProps> = ({
    projects,
    saveProjects,
    constructors,
    saveConstructors,
    allUsers,
    saveUsers,
    currentUser
}) => {
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

    const [isConstructorModalOpen, setIsConstructorModalOpen] = useState(false);
    const [constructorToEdit, setConstructorToEdit] = useState<Constructor | null>(null);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);


    const handleOpenProjectModal = (project: Project | null) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    const handleSaveProject = async (projectData: Omit<Project, 'id'>) => {
        let updatedProjects;
        if (projectToEdit) {
            updatedProjects = projects.map(p => p.id === projectToEdit.id ? { ...projectToEdit, ...projectData } : p);
        } else {
            const newProject: Project = { ...projectData, id: `project-${Date.now()}` };
            updatedProjects = [...projects, newProject];
        }
        await saveProjects(updatedProjects);
        setIsProjectModalOpen(false);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta obra e todos os seus relatórios? Esta ação é irreversível.')) {
            const updatedProjects = projects.filter(p => p.id !== projectId);
            await saveProjects(updatedProjects);
            // Also clean up logs from local storage - this logic will move to backend
             Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`logData-${projectId}-`)) {
                    localStorage.removeItem(key);
                }
            });
            setIsProjectModalOpen(false);
        }
    };
    
    const handleOpenConstructorModal = (c: Constructor | null) => {
        setConstructorToEdit(c);
        setIsConstructorModalOpen(true);
    };

    const handleSaveConstructor = async (constructorData: Omit<Constructor, 'id'>) => {
        let updatedConstructors;
        if (constructorToEdit) {
            updatedConstructors = constructors.map(c => c.id === constructorToEdit.id ? { ...c, ...constructorData } : c);
        } else {
            const newConstructor: Constructor = { ...constructorData, id: `constructor-${Date.now()}` };
            updatedConstructors = [...constructors, newConstructor];
        }
        await saveConstructors(updatedConstructors);
        setIsConstructorModalOpen(false);
    };

    const handleDeleteConstructor = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta construtora?')) {
            await saveConstructors(constructors.filter(c => c.id !== id));
        }
    };

    const handleOpenUserModal = (user: User | null) => {
        setUserToEdit(user);
        setIsUserModalOpen(true);
    };
    
    const handleSaveUser = async (userData: Omit<User, 'id'>) => {
         let updatedUsers;
         if (userToEdit) {
            updatedUsers = allUsers.map(u => u.id === userToEdit.id ? { ...userToEdit, ...userData } : u);
        } else {
            const newUser: User = { ...userData, id: `user-${Date.now()}`};
            updatedUsers = [...allUsers, newUser];
        }
        await saveUsers(updatedUsers);
        setIsUserModalOpen(false);
    };
    
    const handleDeleteUser = async (userId: string) => {
        const userToDelete = allUsers.find(u => u.id === userId);
        if (userToDelete?.role === 'admin') {
            alert("Não é possível excluir o usuário administrador.");
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            await saveUsers(allUsers.filter(u => u.id !== userId));
        }
    };


    return (
        <div>
            <ConstructorManager 
                constructors={constructors}
                onOpenModal={handleOpenConstructorModal}
                onDelete={handleDeleteConstructor}
            />
            
            <ProjectManager 
                projects={projects}
                onOpenModal={handleOpenProjectModal}
            />

             <UserManagementView
                users={allUsers}
                onOpenModal={handleOpenUserModal}
                onDelete={handleDeleteUser}
                currentUser={currentUser}
            />
            
            <ProjectModal 
                isOpen={isProjectModalOpen} 
                onClose={() => setIsProjectModalOpen(false)}
                onSave={handleSaveProject}
                onDelete={handleDeleteProject}
                projectToEdit={projectToEdit}
                constructors={constructors}
                currentUser={currentUser}
            />

            <ConstructorModal 
                isOpen={isConstructorModalOpen}
                onClose={() => setIsConstructorModalOpen(false)}
                onSave={handleSaveConstructor}
                constructorToEdit={constructorToEdit}
            />

            <UserModal 
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                currentUser={currentUser}
                projects={projects}
            />
        </div>
    );
};
