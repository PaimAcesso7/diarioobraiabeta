import React from 'react';
import { LogData, Constructor, Project } from '../types';
import { ClipboardDocumentListIcon, SunIcon, CloudIcon, CloudRainIcon, CloudSunIcon, BoltIcon, WindIcon, BuildingOfficeIcon, ThermometerIcon, ArrowDownIcon, ArrowUpIcon } from './icons';

interface LogFormProps {
    logData: LogData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    constructor?: Constructor;
    elapsedDays?: number | null;
    project: Project; // Adicionado para acessar a data de término
}

const weatherOptions = [
    { label: 'Ensolarado', icon: <SunIcon className="h-6 w-6 text-yellow-500" /> },
    { label: 'Nublado', icon: <CloudIcon className="h-6 w-6 text-gray-500" /> },
    { label: 'Chuvoso', icon: <CloudRainIcon className="h-6 w-6 text-blue-500" /> },
    { label: 'Parcialmente Nublado', icon: <CloudSunIcon className="h-6 w-6 text-sky-500" /> },
    { label: 'Tempestade', icon: <BoltIcon className="h-6 w-6 text-purple-500" /> },
    { label: 'Vento Forte', icon: <WindIcon className="h-6 w-6 text-gray-600" /> },
];

const Card: React.FC<{title: string; children: React.ReactNode, icon?: React.ReactNode}> = ({ title, children, icon }) => (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h2>
        </div>
        <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>
        {children}
    </div>
);

const InputField: React.FC<{label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; disabled?: boolean}> = ({label, name, value, onChange, type = 'text', disabled = false}) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 ease-in-out bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
    </div>
);

export const LogForm: React.FC<LogFormProps> = ({ logData, onChange, constructor, elapsedDays, project }) => {
    const selectedWeather = weatherOptions.find(opt => opt.label === logData.weather) || weatherOptions[0];

    const getRemainingDaysText = () => {
        if (project.endDate) {
            const end = new Date(project.endDate + 'T00:00:00');
            const current = new Date(logData.date + 'T00:00:00');
            if (end >= current) {
                const diffTime = end.getTime() - current.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return <span className="text-sm text-gray-500 dark:text-dark-text-secondary"> (Faltam {diffDays} dias)</span>;
            } else {
                const diffTime = current.getTime() - end.getTime();
                const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 return <span className="text-sm text-red-500 font-bold"> ({overdueDays} dia{overdueDays > 1 ? 's' : ''} atrasado)</span>;
            }
        }
        return null;
    };
    
    return (
        <Card title="Informações Gerais do Diário" icon={<ClipboardDocumentListIcon className="h-6 w-6 text-brand-indigo" />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col sm:flex-row md:flex-col items-center text-center sm:text-left md:text-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    {constructor?.logo ? (
                         <img src={constructor.logo} alt={constructor.name} className="h-28 w-auto max-w-[200px] object-contain rounded-md" />
                    ) : (
                        <div className="h-28 w-28 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                            <BuildingOfficeIcon className="h-14 w-14 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Construtora</p>
                        <p className="font-bold text-gray-800 dark:text-dark-text-primary">{constructor?.name || 'Não informada'}</p>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nome da Obra" name="projectName" value={logData.projectName} onChange={onChange} disabled={true} />
                    <InputField label="Engenheiro(a) Responsável" name="engineer" value={logData.engineer} onChange={onChange} />
                    <InputField label="Responsável pelo Preenchimento" name="responsible" value={logData.responsible} onChange={onChange} disabled={true} />
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Data</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={logData.date}
                            onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 ease-in-out bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            disabled={true}
                        />
                    </div>
                    <InputField label="Horário de Trabalho" name="workHours" value={logData.workHours || ''} onChange={onChange} />
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Dias Corridos</label>
                        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-dark-text-secondary">
                            {elapsedDays !== null && elapsedDays > 0 ? `${elapsedDays}º dia` : 'N/A'}
                            {getRemainingDaysText()}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tempMin" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Temperatura Mínima</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 gap-1">
                                <ThermometerIcon className="h-5 w-5 text-gray-400" />
                                <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <input
                                type="text"
                                id="tempMin"
                                name="tempMin"
                                value={logData.tempMin || ''}
                                onChange={onChange}
                                className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 ease-in-out bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tempMax" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Temperatura Máxima</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 gap-1">
                                <ThermometerIcon className="h-5 w-5 text-gray-400" />
                                <ArrowUpIcon className="h-4 w-4 text-red-500" />
                            </div>
                            <input
                                type="text"
                                id="tempMax"
                                name="tempMax"
                                value={logData.tempMax || ''}
                                onChange={onChange}
                                className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 ease-in-out bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="weather" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Condições do Tempo</label>
                        <div className="flex items-center gap-2">
                             {selectedWeather.icon}
                            <select
                                id="weather"
                                name="weather"
                                value={logData.weather}
                                onChange={onChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600 transition duration-150 ease-in-out"
                            >
                                {weatherOptions.map(opt => (
                                    <option key={opt.label} value={opt.label}>{opt.label}</option>

                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};