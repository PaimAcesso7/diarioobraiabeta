import React, { useState, useMemo } from 'react';
import { Project, User, Constructor, PlatformSettings } from '../types';
import { DashboardView } from './DashboardView';
import { ManagementView } from './ManagementView';
import { ShieldCheckIcon } from './icons';

interface ProjectSelectionProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
    currentUser: User;
    setView: React.Dispatch<React.SetStateAction<'projectSelection' | 'projectDashboard' | 'adminDashboard'>>;
    // Fix: Update prop types to expect a Promise, matching the async function signature.
    saveProjects: (updatedProjects: Project[]) => Promise<void>;
    constructors: Constructor[];
    // Fix: Update prop types to expect a Promise, matching the async function signature.
    saveConstructors: (updatedConstructors: Constructor[]) => Promise<void>;
    allUsers: User[];
    // Fix: Update prop types to expect a Promise, matching the async function signature.
    saveUsers: (updatedUsers: User[]) => Promise<void>;
    platformSettings: PlatformSettings;
}

export const ProjectSelection: React.FC<ProjectSelectionProps> = (props) => {
    const { currentUser, setView, projects, platformSettings, constructors } = props;
    const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard');

    // Filter projects based on user role
    const visibleProjects = useMemo(() => {
        if (currentUser.role === 'admin' || currentUser.role === 'gestor') {
            return projects;
        }
        if (currentUser.role === 'campo') {
            // A 'campo' user only sees projects they are assigned to
            return projects.filter(p => currentUser.assignedProjectIds?.includes(p.id));
        }
        return [];
    }, [projects, currentUser]);
    
    const renderContent = () => {
        if (activeTab === 'dashboard') {
            return <DashboardView 
                        projects={visibleProjects} 
                        onSelectProject={props.onSelectProject} 
                        currentUser={props.currentUser} 
                        constructors={constructors}
                        platformSettings={platformSettings}
                    />;
        }
        if (activeTab === 'management') {
            // Management view is only accessible to 'admin' and 'gestor' roles
            return <ManagementView 
                projects={props.projects} 
                saveProjects={props.saveProjects}
                constructors={props.constructors}
                saveConstructors={props.saveConstructors}
                allUsers={props.allUsers}
                saveUsers={props.saveUsers}
                currentUser={props.currentUser}
            />;
        }
        return null;
    };


    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {activeTab === 'dashboard' ? 'Painel de Obras' : 'Gerenciamento'}
                </h1>
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-dark-border p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'dashboard' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}
                    >
                        Painel
                    </button>
                    {(currentUser.role === 'admin' || currentUser.role === 'gestor') && (
                        <button
                            onClick={() => setActiveTab('management')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'management' ? 'bg-white dark:bg-dark-card shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}
                        >
                            Gerenciar
                        </button>
                    )}
                    {currentUser.role === 'admin' && (
                        <button
                            onClick={() => setView('adminDashboard')}
                            title="Painel do Administrador"
                            className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-dark-text-secondary rounded-lg transition hover:bg-white/50 dark:hover:bg-dark-card/50 flex items-center gap-2"
                        >
                            <ShieldCheckIcon className="h-5 w-5" />
                            <span className="hidden md:inline">Admin</span>
                        </button>
                    )}
                </div>
            </div>

            {renderContent()}
        </div>
    );
};