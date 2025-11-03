import React, { useState, useEffect, useRef } from 'react';
import { Project, Constructor, User } from '../types';
import { TrashIcon, UploadIcon, LoadingIcon } from './icons';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'id'>) => void;
    onDelete: (projectId: string) => void;
    projectToEdit: Project | null;
    constructors: Constructor[];
    currentUser: User;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, onDelete, projectToEdit, constructors, currentUser }) => {
    const [projectData, setProjectData] = useState<Omit<Project, 'id'>>({
        name: '',
        status: 'active',
        address: '',
        size: 0,
        logo: '',
        startDate: new Date().toISOString().split('T')[0],
        constructorId: '',
        artNumber: '',
        creaNumber: '',
        technicalManager: '',
        endDate: '',
    });
    
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [cep, setCep] = useState('');

    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (projectToEdit) {
            setProjectData({
                name: projectToEdit.name,
                status: projectToEdit.status,
                address: projectToEdit.address || '',
                size: projectToEdit.size || 0,
                logo: projectToEdit.logo || '',
                startDate: projectToEdit.startDate || new Date().toISOString().split('T')[0],
                constructorId: projectToEdit.constructorId || '',
                artNumber: projectToEdit.artNumber || '',
                creaNumber: projectToEdit.creaNumber || '',
                technicalManager: projectToEdit.technicalManager || '',
                endDate: projectToEdit.endDate || '',
            });
        } else {
            setProjectData({
                name: '',
                status: 'active',
                address: '',
                size: 0,
                logo: '',
                startDate: new Date().toISOString().split('T')[0],
                constructorId: '',
                artNumber: '',
                creaNumber: '',
                technicalManager: '',
                endDate: '',
            });
        }
        setCep('');
    }, [projectToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: name === 'size' ? Number(value) : value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProjectData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCepLookup = async () => {
        if (cep.length < 8) return;
        setIsCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado');
            const data = await response.json();
            if (data.erro) throw new Error('CEP inválido');
            const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
            setProjectData(prev => ({ ...prev, address: fullAddress }));
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao buscar CEP.');
        } finally {
            setIsCepLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(projectData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{projectToEdit ? 'Editar Obra' : 'Adicionar Nova Obra'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nome da Obra" name="name" value={projectData.name} onChange={handleChange} required />
                         <div className="mb-2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Status da Obra</label>
                            <select id="status" name="status" value={projectData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600">
                                <option value="active">Ativa</option>
                                <option value="on-hold">Em Espera</option>
                                <option value="completed">Concluída</option>
                            </select>
                        </div>
                         <div className="md:col-span-2 mb-2">
                            <label htmlFor="constructorId" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Construtora Responsável</label>
                            <select id="constructorId" name="constructorId" value={projectData.constructorId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600">
                                <option value="">Selecione...</option>
                                {constructors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <InputField label="Responsável Técnico" name="technicalManager" value={projectData.technicalManager || ''} onChange={handleChange} />
                        <InputField label="Nº CREA" name="creaNumber" value={projectData.creaNumber || ''} onChange={handleChange} />
                        <InputField label="Nº ART de Execução" name="artNumber" value={projectData.artNumber || ''} onChange={handleChange} />
                        <InputField label="Área (m²)" name="size" value={String(projectData.size)} onChange={handleChange} type="number" />
                        <InputField label="Data de Início" name="startDate" value={projectData.startDate || ''} onChange={handleChange} type="date" className="date-input-icon" />
                        <InputField label="Data Prevista de Término" name="endDate" value={projectData.endDate || ''} onChange={handleChange} type="date" className="date-input-icon" />
                        
                         <div className="md:col-span-2">
                            <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">CEP (para busca de endereço)</label>
                            <div className="flex gap-2">
                                <input type="text" id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600" />
                                <button type="button" onClick={handleCepLookup} disabled={isCepLoading} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:bg-gray-400 flex items-center justify-center w-28">
                                    {isCepLoading ? <LoadingIcon className="h-5 w-5 animate-spin" /> : 'Buscar'}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <InputField label="Endereço Completo" name="address" value={projectData.address || ''} onChange={handleChange} />
                        </div>

                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Logo da Obra (Opcional)</label>
                            <div className="flex items-center gap-4">
                                 <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {projectData.logo ? <img src={projectData.logo} alt="logo preview" className="h-full w-full object-contain" /> : <span className="text-xs text-gray-500">Preview</span>}
                                </div>
                                <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                                <div>
                                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-dark-text-secondary font-semibold py-2 px-4 rounded-xl transition">
                                        <UploadIcon className="h-5 w-5" />
                                        Carregar
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugestão: Proporção 16:9 (ex: 800 x 450 px)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t dark:border-dark-border">
                        {projectToEdit && (
                            <button type="button" onClick={() => onDelete(projectToEdit.id)} className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 mr-auto">
                                <TrashIcon className="h-4 w-4" />
                                Excluir Obra
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Cancelar</button>
                        <button type="submit" className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; className?: string}> = ({ label, name, value, onChange, type = 'text', required = false, className = '' }) => (
     <div className="mb-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600 ${className}`} />
    </div>
);