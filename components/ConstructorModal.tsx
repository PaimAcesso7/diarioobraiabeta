// Fix: Implement the ConstructorModal component
import React, { useState, useEffect, useRef } from 'react';
import { Constructor } from '../types';
import { UploadIcon } from './icons';

interface ConstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (constructor: Omit<Constructor, 'id'>) => void;
    constructorToEdit: Constructor | null;
}

export const ConstructorModal: React.FC<ConstructorModalProps> = ({ isOpen, onClose, onSave, constructorToEdit }) => {
    const [constructorData, setConstructorData] = useState<Omit<Constructor, 'id'>>({
        name: '',
        logo: '',
        cnpj: '',
    });
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (constructorToEdit) {
            setConstructorData({
                name: constructorToEdit.name,
                logo: constructorToEdit.logo || '',
                cnpj: constructorToEdit.cnpj || '',
            });
        } else {
            setConstructorData({ name: '', logo: '', cnpj: '' });
        }
    }, [constructorToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConstructorData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConstructorData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(constructorData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{constructorToEdit ? 'Editar Construtora' : 'Adicionar Construtora'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <InputField label="Nome da Construtora" name="name" value={constructorData.name} onChange={handleChange} required />
                        <InputField label="CNPJ" name="cnpj" value={constructorData.cnpj || ''} onChange={handleChange} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Logo (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {constructorData.logo ? <img src={constructorData.logo} alt="logo preview" className="h-full w-full object-contain" /> : <span className="text-xs text-gray-500">Preview</span>}
                                </div>
                                <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                                <div>
                                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-gray-600 text-gray-700 dark:text-dark-text-secondary font-semibold py-2 px-4 rounded-xl transition">
                                        <UploadIcon className="h-5 w-5" />
                                        Carregar Logo
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugestão: 200 x 200 px</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-dark-border">
                            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text-primary font-bold py-2 px-4 rounded-xl">Cancelar</button>
                            <button type="submit" className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean}> = ({ label, name, value, onChange, required = false }) => (
     <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input type="text" id={name} name={name} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600" />
    </div>
);