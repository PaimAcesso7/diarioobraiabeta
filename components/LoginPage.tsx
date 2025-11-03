import React, { useState, useEffect } from 'react';
import { User, PlatformSettings } from '../types';
import { AppLogo } from './AppLogo';
import { CheckCircleIcon, DocumentArrowDownIcon, LoadingIcon } from './icons';
import * as api from '../services/apiService';


const PaymentPrompt: React.FC<{
    user: User;
    onVerifyPayment: () => void;
    platformSettings: PlatformSettings;
}> = ({ user, onVerifyPayment, platformSettings }) => {
    const hasPaymentLink = !!user.kiwifyPaymentUrl;
    const [hasClickedPaymentLink, setHasClickedPaymentLink] = useState(false);

    const handleActivateClick = () => {
        if (user.kiwifyPaymentUrl) {
            window.open(user.kiwifyPaymentUrl, '_blank');
            setHasClickedPaymentLink(true);
        }
    };

    return (
        <div className="w-full max-w-sm bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg text-center">
             <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                Seu período de teste terminou
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary mt-2 mb-6">
                Para continuar acessando suas obras e utilizar todas as funcionalidades, por favor, realize o pagamento da sua assinatura.
            </p>
            <div className="space-y-4">
                <button
                    onClick={handleActivateClick}
                    disabled={!hasPaymentLink}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CheckCircleIcon className="h-6 w-6" />
                    Ativar Assinatura (via Kiwify)
                </button>
                {hasClickedPaymentLink && (
                    <div className="animate-fade-in">
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary -my-2">
                            Após concluir o pagamento, retorne e verifique seu acesso.
                        </p>
                        <button
                            onClick={onVerifyPayment}
                            className="w-full bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 animate-pulse-bright mt-4"
                        >
                            <DocumentArrowDownIcon className="h-6 w-6" />
                            Já Paguei, Verificar Acesso
                        </button>
                    </div>
                )}
            </div>
            {!hasPaymentLink && <p className="text-xs text-red-500 mt-4">Nenhum link de pagamento configurado. Por favor, entre em contato com o administrador.</p>}
        </div>
    );
};

const PaymentConfirmationView: React.FC<{ 
    onConfirmed: (user: User) => void; 
    user: User; 
}> = ({ onConfirmed, user }) => {
    const [status, setStatus] = useState<'verifying' | 'confirmed'>('verifying');

    useEffect(() => {
        const timer = setTimeout(async () => {
            // Simulate successful payment verification
            const updatedUser: User = { ...user, accessLevel: 'full' };
            // Fix: Pass an empty user object to fetch all users, satisfying the function's signature.
            const allUsers = await api.fetchUsers({} as User);
            const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
            await api.saveAllUsers(updatedUsers);
            
            setStatus('confirmed');
            
            const redirectTimer = setTimeout(() => {
                onConfirmed(updatedUser);
            }, 1500);
            return () => clearTimeout(redirectTimer);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onConfirmed, user]);

    return (
        <div className="w-full max-w-sm bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg text-center">
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
    )
}

const InputField: React.FC<{label: string; value: string; onChange: (val: string) => void; type?: string; required?: boolean}> = ({ label, value, onChange, type = 'text', required = false}) => (
     <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 ease-in-out bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
        />
    </div>
);

// --- Form Components (moved outside) ---

const LoginForm: React.FC<{
    email: string; setEmail: (v: string) => void;
    password: string; setPassword: (v: string) => void;
    handleLogin: (e: React.FormEvent) => void;
    isLoading: boolean;
    setView: (v: 'login' | 'signup' | 'forgot') => void;
}> = ({ email, setEmail, password, setPassword, handleLogin, isLoading, setView }) => (
    <form onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-1">Bem-vindo(a)!</h2>
        <p className="text-center text-gray-600 dark:text-dark-text-secondary mb-6">Faça login para continuar.</p>
        <InputField type="email" label="E-mail" value={email} onChange={setEmail} required />
        <InputField type="password" label="Senha" value={password} onChange={setPassword} required />
        <div className="text-right mt-2"><button type="button" onClick={() => setView('forgot')} className="text-sm font-semibold text-brand-indigo-light hover:underline">Esqueceu a senha?</button></div>
        <button type="submit" disabled={isLoading} className="w-full bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition mt-4 flex justify-center items-center disabled:opacity-50">{isLoading ? <LoadingIcon className="h-5 w-5"/> : 'Entrar'}</button>
        <p className="text-center mt-4 text-sm">Não tem uma conta? <button type="button" onClick={() => setView('signup')} className="font-semibold text-brand-indigo-light hover:underline">Cadastre-se</button></p>
    </form>
);

const SignUpForm: React.FC<{
    name: string; setName: (v: string) => void;
    whatsapp: string; setWhatsapp: (v: string) => void;
    email: string; setEmail: (v: string) => void;
    password: string; setPassword: (v: string) => void;
    agreedToTerms: boolean; setAgreedToTerms: (v: boolean) => void;
    handleSignUp: (e: React.FormEvent) => void;
    isLoading: boolean;
    setView: (v: 'login' | 'signup' | 'forgot') => void;
    onOpenPrivacyPolicy: () => void;
}> = (props) => (
    <form onSubmit={props.handleSignUp}>
        <h2 className="text-2xl font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-1">Crie sua Conta</h2>
        <p className="text-center text-gray-600 dark:text-dark-text-secondary mb-6">Comece seu teste de 7 dias.</p>
        <InputField type="text" label="Nome Completo" value={props.name} onChange={props.setName} required />
        <InputField type="tel" label="WhatsApp" value={props.whatsapp} onChange={props.setWhatsapp} required />
        <InputField type="email" label="E-mail" value={props.email} onChange={props.setEmail} required />
        <InputField type="password" label="Senha" value={props.password} onChange={props.setPassword} required />
        <div className="mt-4 flex items-start">
            <div className="flex items-center h-5"><input id="terms" name="terms" type="checkbox" checked={props.agreedToTerms} onChange={(e) => props.setAgreedToTerms(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" /></div>
            <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-500 dark:text-gray-400">Eu concordo com os <button type="button" onClick={props.onOpenPrivacyPolicy} className="font-medium text-brand-indigo-light hover:underline">Termos de Uso e Política de Privacidade</button>.</label>
            </div>
        </div>
        <button type="submit" disabled={props.isLoading || !props.agreedToTerms} className="w-full bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition mt-4 flex justify-center items-center disabled:opacity-50">{props.isLoading ? <LoadingIcon className="h-5 w-5"/> : 'Cadastrar'}</button>
        <p className="text-center mt-4 text-sm">Já tem uma conta? <button type="button" onClick={() => props.setView('login')} className="font-semibold text-brand-indigo-light hover:underline">Faça login</button></p>
    </form>
);

const ForgotForm: React.FC<{
    email: string; setEmail: (v: string) => void;
    handleForgotPassword: (e: React.FormEvent) => void;
    setView: (v: 'login' | 'signup' | 'forgot') => void;
}> = ({ email, setEmail, handleForgotPassword, setView }) => (
    <form onSubmit={handleForgotPassword}>
        <h2 className="text-2xl font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-1">Recuperar Senha</h2>
        <p className="text-center text-gray-600 dark:text-dark-text-secondary mb-6">Digite seu e-mail para receber as instruções.</p>
        <InputField type="email" label="E-mail" value={email} onChange={setEmail} required />
        <button type="submit" className="w-full bg-brand-indigo hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition mt-4">Recuperar</button>
        <p className="text-center mt-4 text-sm">Lembrou a senha? <button type="button" onClick={() => setView('login')} className="font-semibold text-brand-indigo-light hover:underline">Voltar para o login</button></p>
    </form>
);


interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    platformSettings: PlatformSettings;
    onOpenPrivacyPolicy: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, platformSettings, onOpenPrivacyPolicy }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [userForPayment, setUserForPayment] = useState<User | null>(null);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const user = await api.loginUser(email, password);
            if (user) {
                let shouldBeBlocked = false;
                if (user.role === 'gestor') {
                    const trialHasExpired = user.accessLevel === 'trial' && user.trialEndsAt && Date.now() > user.trialEndsAt;
                    if (trialHasExpired || user.accessLevel === 'none') {
                        shouldBeBlocked = true;
                    }
                }

                if (shouldBeBlocked) {
                    // Update user status if trial just expired
                    const updatedUser = { ...user, accessLevel: 'none' as 'none' };
                     // Fix: Pass an empty user object to fetch all users, satisfying the function's signature.
                    const allUsers = await api.fetchUsers({} as User);
                    const updatedUsers = allUsers.map(u => (u.id === user.id ? updatedUser : u));
                    await api.saveAllUsers(updatedUsers);
                    setUserForPayment(updatedUser);
                } else {
                    onLoginSuccess(user);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError("Você deve concordar com os Termos de Uso e a Política de Privacidade.");
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);

        const newUser: Omit<User, 'id'> = {
            email, name, whatsapp, password,
            role: 'gestor',
            accessLevel: 'trial',
            trialEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        try {
            await api.createUser(newUser);
            setMessage('Cadastro realizado com sucesso! Você tem 7 dias de teste. Faça o login para começar.');
            setView('login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('Se o e-mail estiver cadastrado, um link de recuperação foi enviado. (Simulação)');
    };

    const handleVerifyPayment = () => {
        setIsVerifyingPayment(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center items-center p-4">
             <div className="text-center mb-8">
                <AppLogo className="h-12 w-auto mx-auto" logoSrc={platformSettings.logo} />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mt-4">
                    {platformSettings.name}
                </h1>
            </div>
            <div className="w-full max-w-sm">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">{error}</p>}
                {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm text-center">{message}</p>}
                
                <div className={`bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg ${userForPayment ? 'hidden' : 'block'}`}>
                    {view === 'login' && <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} isLoading={isLoading} setView={setView} />}
                    {view === 'signup' && <SignUpForm name={name} setName={setName} whatsapp={whatsapp} setWhatsapp={setWhatsapp} email={email} setEmail={setEmail} password={password} setPassword={setPassword} agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} handleSignUp={handleSignUp} isLoading={isLoading} setView={setView} onOpenPrivacyPolicy={onOpenPrivacyPolicy} />}
                    {view === 'forgot' && <ForgotForm email={email} setEmail={setEmail} handleForgotPassword={handleForgotPassword} setView={setView} />}
                </div>

                 {userForPayment && ( isVerifyingPayment ? 
                    <PaymentConfirmationView user={userForPayment} onConfirmed={onLoginSuccess} /> : 
                    <PaymentPrompt user={userForPayment} onVerifyPayment={handleVerifyPayment} platformSettings={platformSettings} />
                 )}
            </div>
        </div>
    );
};