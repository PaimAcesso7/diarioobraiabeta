import React, { useState, useEffect, useMemo } from 'react';
import { Project, SavedInsight, FullLog, LogData, Task, Worker, Constructor, PlatformSettings, User } from '../types';
import { generateProjectInsights } from '../services/geminiService';
import { AnalyzingStarsIcon, SparklesIcon, ClockIcon, PencilIcon } from './icons';

const getAllProjectLogs = (projectId: string): FullLog[] => {
    const logs: FullLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`logData-${projectId}-`) && key.endsWith('-info')) {
            const dateStr = key.substring(projectId.length + 9, key.length - 5);
            const logKey = `logData-${projectId}-${dateStr}`;
            try {
                const logData = JSON.parse(localStorage.getItem(`${logKey}-info`) || '{}') as LogData;
                const tasks = JSON.parse(localStorage.getItem(`${logKey}-tasks`) || '[]') as Task[];
                const impossibleTasks = JSON.parse(localStorage.getItem(`${logKey}-impossible`) || '[]') as Task[];
                const workers = JSON.parse(localStorage.getItem(`${logKey}-workers`) || '[]') as Worker[];
                logs.push({ logData, tasks, impossibleTasks, workers, images: [], platformSettings: {name: '', logo: ''}, constructor: undefined });
            } catch (e) { console.error(`Error parsing log ${logKey}:`, e); }
        }
    }
    return logs.sort((a, b) => new Date(a.logData.date).getTime() - new Date(b.logData.date).getTime());
};

const processLogsForInsights = (logs: FullLog[]): string => {
    if (logs.length < 2) return "Dados insuficientes para gerar insights. É necessário ter pelo menos 2 relatórios.";
    const today = new Date();
    const getWeekNumber = (d: Date) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };
    const currentWeekLogs = logs.filter(l => getWeekNumber(new Date(l.logData.date)) === getWeekNumber(new Date()));
    const lastWeekLogs = logs.filter(l => getWeekNumber(new Date(l.logData.date)) === getWeekNumber(new Date(new Date().setDate(new Date().getDate() - 7))));
    
    let productivityInsight = 'N/A';
    if (currentWeekLogs.length > 0 && lastWeekLogs.length > 0) {
        const calcProd = (logSet: FullLog[]) => {
            const totalTasks = logSet.reduce((sum, l) => sum + l.tasks.length, 0);
            const totalWorkerDays = logSet.reduce((sum, l) => sum + l.workers.reduce((s, w) => s + w.count, 0), 0);
            return totalWorkerDays > 0 ? totalTasks / totalWorkerDays : 0;
        };
        const thisWeekProd = calcProd(currentWeekLogs);
        const lastWeekProd = calcProd(lastWeekLogs);
        if (lastWeekProd > 0) {
            const change = ((thisWeekProd - lastWeekProd) / lastWeekProd) * 100;
            productivityInsight = `${change > 0 ? '+' : ''}${change.toFixed(0)}% (tarefas por colaborador-dia)`;
        }
    }
    const recentLogs = logs.slice(-5);
    const rainyDays = recentLogs.filter(l => l.logData.weather === 'Chuvoso').length;
    const weatherInsight = `${rainyDays} de 5 dias`;
    let blockedTaskInsight = 'N/A';
    if (logs.length > 1) {
        const lastLog = logs[logs.length-1];
        const secondLastLog = logs[logs.length-2];
        const repeatedBlocked = lastLog.impossibleTasks.filter(t1 => secondLastLog.impossibleTasks.some(t2 => t2.text === t1.text));
        if (repeatedBlocked.length > 0) blockedTaskInsight = `'${repeatedBlocked[0].text}' (bloqueada por 2+ dias)`;
    }
    return `- Mudança de produtividade (semanal): ${productivityInsight}\n- Dias com chuva (últimos 5 relatórios): ${weatherInsight}\n- Tarefas repetidamente bloqueadas: ${blockedTaskInsight}`;
};

interface DashboardAIInsightsModalProps {
    projects: Project[];
    onClose: () => void;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
    currentUser: User;
}

export const DashboardAIInsightsModal: React.FC<DashboardAIInsightsModalProps> = ({ projects, onClose, currentUser }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHistoryView, setIsHistoryView] = useState(false);
    const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
    
    const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');

    const insightsStorageKey = selectedProjectId ? `insights-${selectedProjectId}` : '';

    useEffect(() => {
        setInsights('');
        setError('');
        setIsHistoryView(false);

        if (!selectedProjectId) {
            setSavedInsights([]);
            return;
        }
        try {
            const saved = localStorage.getItem(insightsStorageKey);
            setSavedInsights(saved ? JSON.parse(saved) : []);
        } catch (e) {
            console.error("Error loading insights from storage:", e);
            setSavedInsights([]);
        }
    }, [selectedProjectId, insightsStorageKey]);
    
    const handleSaveInsight = () => {
        if (!insights) return;
        const newInsight: SavedInsight = {
            id: `insight-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            content: insights,
            authorType: 'ia',
            authorName: 'IA'
        };
        const updatedInsights = [...savedInsights, newInsight];
        localStorage.setItem(insightsStorageKey, JSON.stringify(updatedInsights));
        setSavedInsights(updatedInsights);
        alert('Insight salvo com sucesso!');
        setIsHistoryView(true);
    };

    const handleStartEditing = (insight: SavedInsight) => {
        setEditingInsightId(insight.id);
        setEditingContent(insight.content);
    };

    const handleCancelEditing = () => {
        setEditingInsightId(null);
        setEditingContent('');
    };

    const handleSaveEdit = () => {
        if (!editingInsightId) return;

        setSavedInsights(prevInsights => {
            const updatedInsights = prevInsights.map(insight => 
                insight.id === editingInsightId 
                // Fix: Cast 'user' to the literal type 'user' to prevent widening to 'string' by TypeScript's type inference.
                ? { ...insight, content: editingContent, authorType: 'user' as 'user', authorName: currentUser.name } 
                : insight
            );
            if (insightsStorageKey) {
                localStorage.setItem(insightsStorageKey, JSON.stringify(updatedInsights));
            }
            return updatedInsights;
        });

        setEditingInsightId(null);
        setEditingContent('');
    };

    const handleGenerate = async () => {
        if (!selectedProject) return;
        setIsLoading(true);
        setError('');
        setInsights('');
        try {
            const logs = getAllProjectLogs(selectedProject.id);
            const processedData = processLogsForInsights(logs);
            if (processedData.startsWith("Dados insuficientes")) {
                setInsights(processedData);
                return;
            }
            const result = await generateProjectInsights(processedData);
            setInsights(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-2xl transform transition-all">
                <div className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                                <SparklesIcon className="h-6 w-6 text-brand-indigo"/>
                                Análise de IA por Obra
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                                {isHistoryView ? `Histórico de: ${selectedProject?.name || 'N/A'}` : 'Gere insights detalhados para uma obra específica'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>

                    <select
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                    >
                        <option value="">-- Selecione uma Obra --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    <div className="min-h-[250px] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg my-4 flex flex-col justify-center items-center">
                        {!selectedProjectId ? <p className="text-gray-500 dark:text-dark-text-secondary">Selecione uma obra para começar.</p> : 
                        isLoading ? <AnalyzingStarsIcon className="h-10 w-10 text-brand-indigo"/> :
                        error ? <p className="text-red-500 text-center">{error}</p> :
                        isHistoryView ? (
                            <div className="w-full h-[300px] overflow-y-auto space-y-4">
                                {savedInsights.length > 0 ? (
                                    savedInsights.slice().reverse().map(insight => (
                                        <div key={insight.id} className="bg-light-card dark:bg-dark-card p-3 rounded-lg shadow-sm group">
                                            {editingInsightId === insight.id ? (
                                                <>
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        rows={5}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary"
                                                    />
                                                    <div className="flex justify-end items-center gap-2 mt-2">
                                                        <button onClick={handleCancelEditing} className="bg-gray-200 dark:bg-dark-border text-xs font-bold py-1 px-3 rounded-md">Cancelar</button>
                                                        <button onClick={handleSaveEdit} className="bg-brand-indigo text-white text-xs font-bold py-1 px-3 rounded-md">Salvar Alterações</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-600 dark:text-dark-text-secondary">
                                                                {new Date(insight.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                            </p>
                                                             <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                                {insight.authorType === 'ia' ? (
                                                                    <>
                                                                        <SparklesIcon className="h-4 w-4 text-purple-500" />
                                                                        <span>Gerado por IA</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PencilIcon className="h-4 w-4 text-blue-500" />
                                                                        <span>Editado por {insight.authorName}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleStartEditing(insight)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <PencilIcon className="h-4 w-4 text-blue-500 hover:text-blue-700"/>
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 whitespace-pre-wrap text-light-text-primary dark:text-dark-text-primary prose prose-sm dark:prose-invert">
                                                        <ul className="space-y-1">
                                                            {insight.content.split('*').filter(s => s.trim()).map((item, index) => <li key={index}>{item.trim()}</li>)}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : <p className="text-center text-gray-500 dark:text-dark-text-secondary py-10">Nenhum insight foi salvo ainda para esta obra.</p> }
                            </div>
                        ) :
                        insights ? (
                            <div className="whitespace-pre-wrap text-light-text-primary dark:text-dark-text-primary w-full prose prose-sm dark:prose-invert">
                                <ul className="space-y-2">
                                    {insights.split('*').filter(s => s.trim()).map((item, index) => <li key={index}>{item.trim()}</li>)}
                                </ul>
                            </div>
                        ) :
                        <p className="text-gray-500 dark:text-dark-text-secondary text-center">Clique em "Gerar Insights" para analisar o histórico de relatórios desta obra.</p>}
                    </div>

                    <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-dark-border">
                        <div>
                             <button onClick={() => setIsHistoryView(!isHistoryView)} disabled={!selectedProjectId} className="flex items-center gap-2 text-sm font-semibold text-brand-indigo hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
                                {isHistoryView ? <><SparklesIcon className="h-5 w-5"/> Gerar Novo Insight</> : <><ClockIcon className="h-5 w-5"/> Ver Histórico</>}
                             </button>
                        </div>
                        <div className="flex gap-2">
                            {insights && !isHistoryView && (
                                <button onClick={handleSaveInsight} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl transition disabled:opacity-50">Salvar</button>
                            )}
                            {!isHistoryView && 
                                <button 
                                    onClick={handleGenerate} 
                                    disabled={isLoading || !selectedProjectId} 
                                    className="flex items-center justify-center gap-2 bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed w-44"
                                >
                                    {isLoading ? (
                                        <>
                                            <AnalyzingStarsIcon className="h-5 w-5" />
                                            <span>Analisando...</span>
                                        </>
                                    ) : (
                                        'Gerar Insights'
                                    )}
                                </button>
                            }
                            <button onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};