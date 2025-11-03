import React from 'react';
import { AppLogo } from './AppLogo';
import { HomeIcon, SunIcon, MoonIcon, UserCircleIcon } from './icons';
import { PlatformSettings } from '../types';

interface HeaderProps {
    platformSettings: PlatformSettings;
    projectName?: string;
    onGoBack?: () => void;
    userName?: string;
    onLogout?: () => void;
    onOpenProfile: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ platformSettings, projectName, onGoBack, userName, onLogout, onOpenProfile, theme, onToggleTheme }) => {
    return (
        <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-40 print:hidden dark:border-b dark:border-dark-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                         {onGoBack && (
                            <button onClick={onGoBack} className="text-gray-500 hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors p-2 -ml-2 rounded-full" title="Início (Seleção de Obras)">
                                <HomeIcon className="h-6 w-6" />
                            </button>
                        )}
                        <AppLogo className="h-8 w-auto" logoSrc={platformSettings.logo} />
                        <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            {platformSettings.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {projectName && (
                             <div className="hidden sm:block text-right">
                                 <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Obra</span>
                                 <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{projectName}</p>
                             </div>
                        )}
                        {userName && (
                             <div className="flex items-center gap-3">
                                <div className="hidden md:block text-right">
                                    <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Usuário</span>
                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{userName}</p>
                                </div>
                                 <button
                                    onClick={onOpenProfile}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                    aria-label="Meu Perfil"
                                    title="Meu Perfil"
                                >
                                    <UserCircleIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={onToggleTheme}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                    aria-label="Alternar tema"
                                >
                                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                                </button>
                                <button onClick={onLogout} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-dark-text-secondary font-semibold py-2 px-4 rounded-lg transition text-sm">
                                    Sair
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
