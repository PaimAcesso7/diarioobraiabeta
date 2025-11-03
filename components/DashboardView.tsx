import React, { useState } from 'react';
import { Project, User, Constructor, PlatformSettings } from '../types';
import { BuildingOfficeIcon, SparklesIcon, ChartBarIcon } from './icons';
import { DashboardAIInsightsModal } from './DashboardAIInsightsModal';
import { ProjectChartsModal } from './ProjectChartsModal';
import { ChartsPrintPreviewModal } from './ChartsPrintPreviewModal';

interface DashboardViewProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
    currentUser: User;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
}

const ProjectCard: React.FC<{ project: Project; onSelect: () => void }> = ({ project, onSelect }) => {
    const statusClasses = {
        'active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'completed': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    
    return (
        <div 
            onClick={onSelect}
            className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
        >
            <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {project.logo ? 
                    <img src={project.logo} alt={project.name} className="h-full w-full object-cover" /> :
                    <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
                }
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{project.name}</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary flex-grow truncate">{project.address}</p>
                <div className="mt-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[project.status]}`}>
                        {project.status === 'active' ? 'Ativa' : project.status === 'on-hold' ? 'Em espera' : 'Concluída'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ projects, onSelectProject, currentUser, constructors, platformSettings }) => {
    const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
    const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
    const [isChartsPrintPreviewOpen, setIsChartsPrintPreviewOpen] = useState(false);
    const [projectForChart, setProjectForChart] = useState<Project | null>(null);
    const [chartDataForPrint, setChartDataForPrint] = useState<any | null>(null);

    const handleOpenCharts = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        setProjectForChart(project);
        setIsChartsModalOpen(true);
    };

    const handleCloseCharts = () => {
        setIsChartsModalOpen(false);
        setProjectForChart(null);
    };

    const handleOpenChartsPrintPreview = (data: any) => {
        setChartDataForPrint(data);
        setIsChartsModalOpen(false); // Close interactive modal
        setIsChartsPrintPreviewOpen(true); // Open print preview modal
    };
    
    const handleCloseChartsPrintPreview = () => {
        setIsChartsPrintPreviewOpen(false);
        setProjectForChart(null);
        setChartDataForPrint(null);
    };

    return (
        <>
            {(currentUser.role === 'admin' || currentUser.role === 'gestor') && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsInsightsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300 shadow-lg"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        Análise IA (Geral)
                    </button>
                </div>
            )}
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map(project => (
                        <div key={project.id} className="relative group">
                            <ProjectCard project={project} onSelect={() => onSelectProject(project)} />
                             <button 
                                 onClick={(e) => handleOpenCharts(e, project)}
                                 className="absolute top-2 right-2 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                                 title="Ver Gráficos"
                            >
                                <ChartBarIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 dark:bg-dark-card rounded-xl">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">Nenhuma obra encontrada</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                        {currentUser.role === 'campo' 
                            ? 'Você ainda não foi atribuído a nenhuma obra.' 
                            : 'Comece adicionando uma nova obra na aba "Gerenciar".'
                        }
                    </p>
                </div>
            )}

            {isInsightsModalOpen && <DashboardAIInsightsModal projects={projects} onClose={() => setIsInsightsModalOpen(false)} constructors={constructors} platformSettings={platformSettings} currentUser={currentUser} />}
            
            {isChartsModalOpen && projectForChart && 
                <ProjectChartsModal 
                    project={projectForChart} 
                    onClose={handleCloseCharts} 
                    onPrint={handleOpenChartsPrintPreview}
                    constructors={constructors} 
                    platformSettings={platformSettings} 
                />}
            
            {isChartsPrintPreviewOpen && projectForChart && chartDataForPrint &&
                <ChartsPrintPreviewModal 
                    onClose={handleCloseChartsPrintPreview}
                    project={projectForChart}
                    constructors={constructors}
                    platformSettings={platformSettings}
                    formattedChartData={chartDataForPrint}
                />}
        </>
    );
};