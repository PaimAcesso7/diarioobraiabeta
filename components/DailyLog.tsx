import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Project, User, Constructor, LogData, Task, Worker, ImageFile, AnalysisResult, PlatformSettings, FullLog } from '../types';
import { LogForm } from './LogForm';
import { ImageHandler } from './ImageHandler';
import { TaskList } from './TaskList';
import { ImpossibleTaskList } from './ImpossibleTaskList';
import { WorkerCounter } from './WorkerCounter';
import { Observations } from './Observations';
import { generateTaskDescriptionFromImages } from '../services/geminiService';
import * as api from '../services/apiService';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, DocumentCheckIcon, PrinterIcon, PencilIcon, LoadingIcon, CheckIcon } from './icons';
import { PrintPreviewModal } from './PrintPreviewModal';

// Fix: Define DailyLogProps interface for the component's props.
interface DailyLogProps {
    project: Project;
    date: string;
    currentUser: User;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
    onBackToCalendar: () => void;
    onNextDay: () => void;
    onPrevDay: () => void;
}

const SaveStatusIndicator: React.FC<{ status: 'idle' | 'editing' | 'saving' | 'saved' }> = ({ status }) => {
    switch (status) {
        case 'editing':
            return <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary"><PencilIcon className="h-4 w-4" /><span>Editando...</span></div>;
        case 'saving':
            return <div className="flex items-center gap-2 text-sm text-brand-indigo font-semibold"><LoadingIcon className="h-4 w-4 animate-spin" /><span>Salvando...</span></div>;
        case 'saved':
            return <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold"><CheckIcon className="h-4 w-4" /><span>Salvo</span></div>;
        default:
            return <div className="h-5"></div>; // Placeholder to prevent layout shift
    }
};

export const DailyLog: React.FC<DailyLogProps> = ({
    project,
    date,
    currentUser,
    constructors,
    platformSettings,
    onBackToCalendar,
    onNextDay,
    onPrevDay
}) => {
    
    const [logData, setLogData] = useState<LogData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [impossibleTasks, setImpossibleTasks] = useState<Task[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [taskHistory, setTaskHistory] = useState<Task[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [visibleAnalysisResults, setVisibleAnalysisResults] = useState<AnalysisResult[]>([]);
    const [hiddenAnalysisResults, setHiddenAnalysisResults] = useState<AnalysisResult[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showAutofillMessage, setShowAutofillMessage] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'editing' | 'saving' | 'saved'>('idle');
    const isInitialMount = useRef(true);

    // Data Loading Effect
    useEffect(() => {
        const loadLogData = async () => {
            setIsLoading(true);
            let wasAutofilled = false;

            const existingLog = await api.fetchDailyLog(project.id, date);
            
            if (existingLog) {
                setLogData(existingLog.logData);
                setTasks(existingLog.tasks || []);
                setImpossibleTasks(existingLog.impossibleTasks || []);
                setWorkers(existingLog.workers || []);
                setImages(existingLog.images || []);
            } else {
                // No log for today, try to autofill from the last one
                const lastLog = await api.findLastLog(project.id, date);
                if (lastLog) {
                     setLogData({
                        ...lastLog.logData,
                        date: date, 
                        projectName: project.name,
                        responsible: currentUser.name,
                    });
                    setTasks(lastLog.tasks || []);
                    setImpossibleTasks(lastLog.impossibleTasks || []);
                    setWorkers(lastLog.workers || []);
                    setImages([]); // Never copy images
                    wasAutofilled = true;
                } else {
                    // First log ever, start fresh
                    setLogData({
                        projectName: project.name,
                        engineer: project.technicalManager || '',
                        responsible: currentUser.name,
                        date: date,
                        weather: 'Ensolarado',
                        workHours: '7:00h as 12:00h e 13:00h as 17:00h',
                        tempMin: '18º',
                        tempMax: '27º',
                    });
                    setTasks([]);
                    setImpossibleTasks([]);
                    setWorkers([]);
                    setImages([]);
                }
            }

            const history = await api.fetchTaskHistory(project.id);
            setTaskHistory(history);
            
            setShowAutofillMessage(wasAutofilled);
            setIsLoading(false);
            isInitialMount.current = true; // Reset for auto-save
        };

        loadLogData();
    }, [project.id, date, project.name, project.technicalManager, currentUser.name]);

    // Fix: Rename 'constructor' to 'projectConstructor' to avoid potential keyword conflicts.
    const projectConstructor = useMemo(() => constructors.find(c => c.id === project.constructorId), [constructors, project.constructorId]);

    const elapsedDays = useMemo(() => {
        if (!project.startDate) return null;
        const start = new Date(project.startDate + 'T00:00:00');
        const current = new Date(date + 'T00:00:00');
        if (current < start) return 0;
        const diffTime = Math.abs(current.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }, [project.startDate, date]);

    // Auto-save effect
    useEffect(() => {
        if (isInitialMount.current || isLoading || !logData) {
            if (!isLoading) isInitialMount.current = false;
            return;
        }

        setSaveStatus('editing');

        const timerId = setTimeout(() => {
            setSaveStatus('saving');
            
            // Fix: Add missing 'constructor' and 'elapsedDays' properties to the FullLog object.
            const fullLog: FullLog = {
                logData,
                tasks,
                impossibleTasks,
                workers,
                images,
                constructor: projectConstructor,
                elapsedDays,
                platformSettings,
            };

            api.saveDailyLog(project.id, date, fullLog).then(() => {
                 setTimeout(() => {
                     setSaveStatus('saved');
                }, 500);
            });

            if (showAutofillMessage) {
                setShowAutofillMessage(false);
            }

        }, 1500);

        return () => {
            clearTimeout(timerId);
        };
    }, [logData, tasks, impossibleTasks, workers, images, project.id, date, platformSettings, isLoading, showAutofillMessage, projectConstructor, elapsedDays]);

    const handleLogDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if(logData) {
            setLogData(prev => ({ ...prev!, [e.target.name]: e.target.value }));
        }
    };

    const handleAnalyzeImages = useCallback(async () => {
        if (images.length === 0) return;
        setIsGenerating(true);
        setVisibleAnalysisResults([]);
        setHiddenAnalysisResults([]);
        try {
            const textHistory = taskHistory.map(t => t.text);
            const results = await generateTaskDescriptionFromImages(images, textHistory);
            setHiddenAnalysisResults(results);
        } catch (error) {
            console.error("Error generating tasks:", error);
            alert(`Ocorreu um erro ao analisar as imagens. Verifique o console para mais detalhes. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    }, [images, taskHistory]);
    
    const handleShowResults = () => {
        setVisibleAnalysisResults(hiddenAnalysisResults);
    };
    
    const onAcceptSuggestion = (result: AnalysisResult) => {
        onAddTask(result.suggestion, '');
        setVisibleAnalysisResults(prev => prev.filter(r => r.id !== result.id));
    };

    const onUpdateSuggestion = (resultId: string, newText: string) => {
        setVisibleAnalysisResults(prev => prev.map(r => r.id === resultId ? { ...r, suggestion: newText } : r));
    };

    const onDiscardSuggestion = (resultId: string) => {
        setVisibleAnalysisResults(prev => prev.filter(r => r.id !== resultId));
    };

    const onAddTask = (taskText: string, location: string) => {
        setTasks(prev => [...prev, { id: `task-${Date.now()}`, text: taskText, location }]);
    };
    
    const onAddImpossibleTask = (taskText: string) => {
        setImpossibleTasks(prev => [...prev, { id: `imp-task-${Date.now()}`, text: taskText }]);
    };

    if (isLoading || !logData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingIcon className="h-12 w-12 text-brand-indigo" />
            </div>
        );
    }

    return (
        <div className="relative">
             {showAutofillMessage && (
                <div className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded-md mb-6 flex justify-between items-center transition-all duration-300">
                    <p>
                        <span className="font-bold">Informação:</span> Os dados foram preenchidos com base no último relatório. Verifique e ajuste as informações para o dia de hoje.
                    </p>
                    <button onClick={() => setShowAutofillMessage(false)} className="text-blue-700 dark:text-blue-300 font-bold text-2xl leading-none px-2 -mr-2">&times;</button>
                </div>
            )}
            <div className="space-y-6 pb-24">
                <LogForm logData={logData} onChange={handleLogDataChange} constructor={projectConstructor} elapsedDays={elapsedDays} project={project} />
                <ImageHandler 
                    images={images}
                    setImages={setImages}
                    isLoading={isGenerating}
                    analysisResults={visibleAnalysisResults}
                    hiddenResultsCount={hiddenAnalysisResults.length}
                    onShowResults={handleShowResults}
                    onAcceptSuggestion={onAcceptSuggestion}
                    onUpdateSuggestion={onUpdateSuggestion}
                    onDiscardSuggestion={onDiscardSuggestion}
                    onAnalyzeImages={handleAnalyzeImages}
                />
                <TaskList tasks={tasks} setTasks={setTasks} taskHistory={taskHistory} onAddTask={onAddTask} />
                <ImpossibleTaskList tasks={impossibleTasks} setTasks={setImpossibleTasks} taskHistory={[]} onAddTask={onAddImpossibleTask} />
                <WorkerCounter workers={workers} setWorkers={setWorkers} />
                <Observations observations={logData.observations || ''} onChange={handleLogDataChange} />
            </div>
            
            <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm p-3 border-t border-gray-200 dark:border-dark-border shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)] print:hidden">
                <div className="container mx-auto flex justify-between items-center">
                    <button onClick={onBackToCalendar} className="flex items-center gap-2 bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-secondary font-bold py-2 px-4 rounded-xl transition">
                        <CalendarDaysIcon className="h-5 w-5" />
                        Calendário
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={onPrevDay} className="p-2 bg-brand-indigo text-white rounded-full shadow-md hover:bg-indigo-700 transition">
                            <ChevronLeftIcon className="h-6 w-6"/>
                        </button>
                        <span className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary text-center w-auto md:w-96 hidden md:block">
                            {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                         <span className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary text-center w-auto md:w-96 md:hidden">
                            {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                        </span>
                        <button onClick={onNextDay} className="p-2 bg-brand-indigo text-white rounded-full shadow-md hover:bg-indigo-700 transition">
                            <ChevronRightIcon className="h-6 w-6"/>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <SaveStatusIndicator status={saveStatus} />
                        <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition">
                            <PrinterIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Imprimir / PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            <PrintPreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                project={project}
                logData={logData}
                tasks={tasks}
                impossibleTasks={impossibleTasks}
                workers={workers}
                images={images}
                constructor={projectConstructor}
                elapsedDays={elapsedDays}
                platformSettings={platformSettings}
            />
        </div>
    );
};