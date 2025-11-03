import React from 'react';
import { PrintableViewProps } from '../types';
import { AppLogo } from './AppLogo';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    UsersIcon,
    CameraIcon,
    PencilSquareIcon,
} from './icons';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`mt-6 ${className}`}>
        <div className="flex items-center gap-3 border-b-2 border-gray-200 pb-2 mb-3">
            {icon}
            <h3 className="text-base font-bold text-brand-blue uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
    </div>
);

export const PrintableView: React.FC<PrintableViewProps> = ({
    project,
    logData,
    tasks,
    impossibleTasks,
    workers,
    images,
    constructor,
    elapsedDays,
    platformSettings
}) => {
    const totalWorkers = workers.reduce((sum, worker) => sum + Number(worker.count), 0);

    const getRemainingDaysText = () => {
        if (project?.endDate) {
            const end = new Date(project.endDate + 'T00:00:00');
            const current = new Date(logData.date + 'T00:00:00');
            if (end >= current) {
                const diffTime = end.getTime() - current.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `(Faltam ${diffDays} dias)`;
            } else {
                const diffTime = current.getTime() - end.getTime();
                const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return <span className="text-red-600 font-bold">({overdueDays} dia{overdueDays > 1 ? 's' : ''} atrasado)</span>;
            }
        }
        return '';
    };

    return (
        <div className="bg-white text-gray-800 p-8 font-sans text-sm">
            {/* --- HEADER --- */}
            <header className="flex justify-between items-start pb-4 mb-4 border-b-2 border-gray-300">
                <div className="text-left">
                    {platformSettings?.logo && <AppLogo logoSrc={platformSettings.logo} className="h-10 w-auto mb-2" />}
                    <h1 className="text-xl font-bold text-gray-800">{platformSettings?.name || 'Diário de Obra'}</h1>
                    <p className="text-gray-500">Relatório Diário de Obra</p>
                </div>
                <div className="flex items-start gap-4">
                    {constructor?.logo && <img src={constructor.logo} alt="Logo da Construtora" className="h-16 max-w-[150px] object-contain" />}
                    {project?.logo && <img src={project.logo} alt="Logo da Obra" className="h-16 max-w-[150px] object-contain" />}
                </div>
            </header>

            {/* --- GENERAL INFO --- */}
            <Section title="Informações Gerais" icon={<ClipboardDocumentListIcon className="h-5 w-5 text-brand-blue" />}>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <InfoItem label="Obra" value={logData.projectName} />
                    <InfoItem label="Construtora" value={constructor?.name || 'N/A'} />
                    <InfoItem label="Data" value={new Date(logData.date + 'T00:00:00').toLocaleDateString('pt-BR')} />
                    <InfoItem label="Eng. Responsável" value={logData.engineer} />
                    <InfoItem label="Resp. Preenchimento" value={logData.responsible} />
                    <InfoItem label="Dias Corridos" value={<>{elapsedDays ? `${elapsedDays}º dia` : 'N/A'} <span className="text-xs">{getRemainingDaysText()}</span></>} />
                    <InfoItem label="Horário de Trabalho" value={logData.workHours || 'N/A'} />
                    <InfoItem label="Condições do Tempo" value={logData.weather} />
                    <InfoItem label="Temperatura" value={`Mín: ${logData.tempMin || 'N/A'} / Máx: ${logData.tempMax || 'N/A'}`} />
                </div>
            </Section>

            {/* --- WORKERS --- */}
            <Section title={`Colaboradores (Total: ${totalWorkers})`} icon={<UsersIcon className="h-5 w-5 text-brand-blue" />}>
                {workers.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 columns-2">
                        {workers.map(worker => (
                            <li key={worker.id}>{worker.count}x {worker.role}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">Nenhum colaborador registrado.</p>
                )}
            </Section>

            {/* --- TASKS --- */}
            <Section title="Atividades Realizadas" icon={<CheckCircleIcon className="h-5 w-5 text-brand-blue" />}>
                {tasks.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-1 font-semibold text-black">Descrição</th>
                                <th className="pb-1 font-semibold w-1/4 text-black">Local</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="border-b border-gray-100">
                                    <td className="py-1 text-black">{task.text}</td>
                                    <td className="py-1 text-black">{task.location || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 italic">Nenhuma atividade realizada registrada.</p>
                )}
            </Section>
            
            {/* --- IMPOSSIBLE TASKS --- */}
            {impossibleTasks.length > 0 && (
                <Section title="Atividades Impossibilitadas" icon={<NoSymbolIcon className="h-5 w-5 text-brand-blue" />}>
                    <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-gray-200">
                                <th className="pb-1 font-semibold text-black">Descrição</th>
                                <th className="pb-1 font-semibold w-1/4 text-black">Motivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {impossibleTasks.map(task => (
                                <tr key={task.id} className="border-b border-gray-100">
                                    <td className="py-1 text-black">{task.text}</td>
                                    <td className="py-1 text-black">{task.reason || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>
            )}

            {/* --- OBSERVATIONS --- */}
            {logData.observations && (
                 <Section title="Observações" icon={<PencilSquareIcon className="h-5 w-5 text-brand-blue" />}>
                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{logData.observations}</p>
                </Section>
            )}
            
            {/* --- IMAGES --- */}
            {images.length > 0 && (
                <Section title="Relatório Fotográfico" icon={<CameraIcon className="h-5 w-5 text-brand-blue" />} className="print-page-break">
                     <div className="grid grid-cols-2 gap-4">
                        {images.map(image => (
                            <div key={image.id} className="border border-gray-200 p-1 rounded-md">
                                <img src={image.dataUrl} alt="Foto da obra" className="w-full h-auto" />
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
};