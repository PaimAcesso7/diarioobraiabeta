import React, { useState, useEffect } from 'react';
import { Project, User, Constructor, PlatformSettings } from './types';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { ProjectSelection } from './components/ProjectSelection';
import { ProjectDashboard } from './components/ProjectDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import * as api from './services/apiService';
import { LoadingIcon } from './components/icons';

export const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [constructors, setConstructors] = useState<Constructor[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({ name: 'Diário de Obra Inteligente', logo: '', termsOfService: '', privacyPolicy: '' });
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [view, setView] = useState<'projectSelection' | 'projectDashboard' | 'adminDashboard'>('projectSelection');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);
    
    const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

    // Firebase auth listener
    useEffect(() => {
        const unsubscribe = api.onAuthChange((user) => {
            setCurrentUser(user);
            setIsAuthLoading(false);
        });
        return () => unsubscribe(); // Cleanup subscription
    }, []);

    // Initial data fetch, triggered when user logs in
    useEffect(() => {
        const loadInitialData = async () => {
            if (!currentUser) return;
            setIsDataLoading(true);
            try {
                const [projects, constructors, settings] = await Promise.all([
                    api.fetchProjects(currentUser),
                    api.fetchConstructors(),
                    api.fetchPlatformSettings(),
                ]);
                setProjects(projects);
                setConstructors(constructors);
                setPlatformSettings(settings);

                if (currentUser.role === 'admin' || currentUser.role === 'gestor') {
                    const users = await api.fetchUsers(currentUser);
                    setAllUsers(users);
                } else {
                    setAllUsers([]);
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setIsDataLoading(false);
            }
        };

        loadInitialData();
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = async () => {
        await api.logoutUser();
        // The onAuthChange listener will set currentUser to null
    };
    
    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setView('projectDashboard');
    };
    
    const handleBackToProjectSelection = () => {
        setSelectedProject(null);
        setView('projectSelection');
    };

    const saveProjects = async (updatedProjects: Project[]) => {
        await api.saveAllProjects(updatedProjects);
        setProjects(updatedProjects);
    };

    const saveConstructors = async (updatedConstructors: Constructor[]) => {
        await api.saveAllConstructors(updatedConstructors);
        setConstructors(updatedConstructors);
    };
    
    const saveAllUsers = async (updatedUsers: User[]) => {
        await api.saveAllUsers(updatedUsers);
        setAllUsers(updatedUsers);

        if(currentUser) {
            const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
            if(updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
            }
        }
    };
    
    const handleSavePlatformSettings = async (settings: PlatformSettings) => {
        await api.savePlatformSettings(settings);
        setPlatformSettings(settings);
    };

    const handleAccountDeletion = async () => {
        if (currentUser) {
            await api.deleteUser(currentUser.id);
            handleLogout();
        }
    };
    
    if (isAuthLoading) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <LoadingIcon className="h-12 w-12 text-brand-indigo" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <>
                <LoginPage onLoginSuccess={handleLoginSuccess} platformSettings={platformSettings} onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)} />
                <PrivacyPolicyModal 
                    isOpen={isPrivacyPolicyOpen} 
                    onClose={() => setIsPrivacyPolicyOpen(false)} 
                    termsOfService={platformSettings.termsOfService}
                    privacyPolicy={platformSettings.privacyPolicy}
                />
            </>
        );
    }

    if (isDataLoading) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <LoadingIcon className="h-12 w-12 text-brand-indigo" />
            </div>
        );
    }

    const renderContent = () => {
        if (selectedProject && view === 'projectDashboard') {
            return <ProjectDashboard 
                        project={selectedProject} 
                        currentUser={currentUser} 
                        constructors={constructors}
                        platformSettings={platformSettings}
                   />;
        }
        
        switch (view) {
            case 'adminDashboard':
                return <AdminDashboard 
                            allUsers={allUsers}
                            platformSettings={platformSettings}
                            onSavePlatformSettings={handleSavePlatformSettings}
                            saveAllUsers={saveAllUsers}
                        />;
            case 'projectSelection':
            default:
                return <ProjectSelection 
                            projects={projects} 
                            onSelectProject={handleSelectProject}
                            currentUser={currentUser}
                            setView={setView}
                            saveProjects={saveProjects}
                            constructors={constructors}
                            saveConstructors={saveConstructors}
                            allUsers={allUsers}
                            saveUsers={saveAllUsers}
                            platformSettings={platformSettings}
                        />;
        }
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <Header
                platformSettings={platformSettings}
                projectName={selectedProject?.name}
                onGoBack={selectedProject ? handleBackToProjectSelection : undefined}
                userName={currentUser.name}
                onLogout={handleLogout}
                onOpenProfile={() => setIsUserProfileOpen(true)}
                theme={theme}
                onToggleTheme={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
            />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
            <UserProfileModal 
                isOpen={isUserProfileOpen}
                onClose={() => setIsUserProfileOpen(false)}
                currentUser={currentUser}
                onSave={saveAllUsers}
                onDeleteAccount={handleAccountDeletion}
            />
             <PrivacyPolicyModal 
                isOpen={isPrivacyPolicyOpen} 
                onClose={() => setIsPrivacyPolicyOpen(false)} 
                termsOfService={platformSettings.termsOfService}
                privacyPolicy={platformSettings.privacyPolicy}
             />
        </div>
    );
};