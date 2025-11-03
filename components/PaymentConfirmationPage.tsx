import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, LoadingIcon } from './icons';

interface PaymentConfirmationPageProps {
    onConfirm: () => void;
}

export const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({ onConfirm }) => {
    const [status, setStatus] = useState<'verifying' | 'confirmed'>('verifying');

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus('confirmed');
            const redirectTimer = setTimeout(() => {
                onConfirm();
            }, 1500); // Wait a bit on the success message before redirecting
            return () => clearTimeout(redirectTimer);
        }, 2000); // Simulate a 2-second verification delay

        return () => clearTimeout(timer);
    }, [onConfirm]);

    return (
        <div className="flex justify-center items-center h-96">
            <div className="bg-light-card dark:bg-dark-card p-10 rounded-xl shadow-lg text-center">
                {status === 'verifying' ? (
                    <>
                        <LoadingIcon className="h-12 w-12 text-brand-indigo mx-auto animate-spin" />
                        <h2 className="text-xl font-bold mt-4">Verificando seu pagamento...</h2>
                        <p className="text-gray-500 dark:text-dark-text-secondary mt-2">Isso pode levar alguns instantes.</p>
                    </>
                ) : (
                     <>
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold mt-4 text-green-600">Pagamento Confirmado!</h2>
                        <p className="text-gray-600 dark:text-dark-text-secondary mt-2">Seu acesso foi liberado. Redirecionando...</p>
                    </>
                )}
            </div>
        </div>
    );
};