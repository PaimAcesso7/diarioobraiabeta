import React from 'react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    termsOfService?: string;
    privacyPolicy?: string;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose, termsOfService, privacyPolicy }) => {
    if (!isOpen) return null;
    
    const defaultTerms = "Os Termos de Uso ainda não foram definidos pelo administrador.";
    const defaultPolicy = "A Política de Privacidade ainda não foi definida pelo administrador.";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b dark:border-dark-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Termos de Uso e Política de Privacidade</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                    </div>
                </div>
                <div className="flex-grow p-6 overflow-y-auto prose dark:prose-invert max-w-none">
                    <h3>Termos de Uso</h3>
                    <p>{termsOfService || defaultTerms}</p>
                    
                    <h3 className="mt-6">Política de Privacidade</h3>
                    <p>{privacyPolicy || defaultPolicy}</p>

                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-border/50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl">
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};