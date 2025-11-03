import React, { useState, useRef } from 'react';
import { User, PlatformSettings } from '../types';
import { UploadIcon } from './icons';
import * as api from '../services/apiService';

interface AdminDashboardProps {
    allUsers: User[];
    platformSettings: PlatformSettings;
    onSavePlatformSettings: (settings: PlatformSettings) => Promise<void>;
    saveAllUsers: (users: User[]) => Promise<void>;
}

const getAccessLevelInfo = (user: User) => {
    switch (user.accessLevel) {
        case 'full':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Acesso Completo</span>;
        case 'trial':
            const daysLeft = user.trialEndsAt ? Math.ceil((user.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
            if (daysLeft > 0) {
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Teste ({daysLeft} dias restantes)</span>;
            }
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Teste Expirado</span>;
        case 'none':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Acesso Revogado</span>;
        default:
            return null;
    }
};

const PaymentLinkModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: string, url: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [url, setUrl] = useState(user.kiwifyPaymentUrl || '');

    const handleSave = () => {
        onSave(user.id, url);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">Link de Pagamento Kiwify</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Insira o link de pagamento para o usuário: <strong>{user.name}</strong></p>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://...link_do_produto_kiwify..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="bg-gray-200 dark:bg-dark-border font-bold py-2 px-4 rounded-xl">Cancelar</button>
                        <button onClick={handleSave} className="bg-brand-indigo text-white font-bold py-2 px-4 rounded-xl">Salvar Link</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, platformSettings, onSavePlatformSettings, saveAllUsers }) => {
    const [settings, setSettings] = useState(platformSettings);
    const [paymentModalUser, setPaymentModalUser] = useState<User | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = async () => {
        await onSavePlatformSettings(settings);
        alert('Configurações da plataforma salvas com sucesso!');
    };

    const handleSavePaymentLink = (userId: string, url: string) => {
        const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, kiwifyPaymentUrl: url } : u);
        saveAllUsers(updatedUsers);
    };

    const handleUpdateUserAccess = (userId: string, accessLevel: 'trial' | 'full' | 'none') => {
        const updatedUsers = allUsers.map(u => {
            if (u.id === userId) {
                const updatedUser: User = { ...u, accessLevel };
                if (accessLevel === 'trial') {
                    updatedUser.trialEndsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
                }
                return updatedUser;
            }
            return u;
        });
        saveAllUsers(updatedUsers);
    };
    
    return (
        <div className="space-y-8">
            {/* User Management */}
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Gerenciamento de Usuários e Assinaturas</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">E-mail</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-light-card dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {allUsers.filter(u => u.role !== 'admin').map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text-primary">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">{getAccessLevelInfo(user)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setPaymentModalUser(user)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">Link de Pagamento</button>
                                            <span className="text-gray-300 dark:text-gray-600">|</span>
                                            <button onClick={() => handleUpdateUserAccess(user.id, 'full')} className="text-green-600 hover:text-green-900 dark:hover:text-green-400">Conceder Acesso</button>
                                            <button onClick={() => handleUpdateUserAccess(user.id, 'trial')} className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400">Iniciar Teste</button>
                                            <button onClick={() => handleUpdateUserAccess(user.id, 'none')} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Revogar Acesso</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform Settings */}
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Configurações da Plataforma</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Nome da Plataforma</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={settings.name}
                            onChange={handleSettingsChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Logo da Plataforma</label>
                        <div className="flex items-center gap-4">
                             <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {settings.logo ? (
                                    <img src={settings.logo} alt="logo preview" className="h-full w-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-500">Preview</span>
                                )}
                            </div>
                            <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                            <div>
                                <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 text-light-text-secondary dark:text-dark-text-secondary font-semibold py-2 px-4 rounded-xl transition">
                                    <UploadIcon className="h-5 w-5" />
                                    Carregar Logo
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugestão: 300 x 300 px</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t dark:border-dark-border">
                     <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Textos Legais (LGPD)</h3>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="termsOfService" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Termos de Uso</label>
                            <textarea 
                                id="termsOfService"
                                name="termsOfService"
                                value={settings.termsOfService || ''}
                                onChange={handleSettingsChange}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                            />
                        </div>
                         <div>
                            <label htmlFor="privacyPolicy" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Política de Privacidade</label>
                            <textarea 
                                id="privacyPolicy"
                                name="privacyPolicy"
                                value={settings.privacyPolicy || ''}
                                onChange={handleSettingsChange}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
                            />
                        </div>
                     </div>
                </div>

                 <div className="mt-6 text-right">
                    <button onClick={handleSaveSettings} className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl">
                        Salvar Configurações
                    </button>
                </div>
            </div>
            
            {paymentModalUser && <PaymentLinkModal user={paymentModalUser} onClose={() => setPaymentModalUser(null)} onSave={handleSavePaymentLink} />}
        </div>
    );
};