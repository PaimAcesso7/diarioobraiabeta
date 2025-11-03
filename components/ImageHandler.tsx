import React, { useRef, useState, useEffect } from 'react';
import { ImageFile, AnalysisResult } from '../types';
import { CameraIcon, UploadIcon, TrashIcon, SparklesIcon, AnalyzingStarsIcon, CheckIcon } from './icons';

interface ImageHandlerProps {
    images: ImageFile[];
    setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    isLoading: boolean;
    analysisResults: AnalysisResult[];
    hiddenResultsCount: number;
    onShowResults: () => void;
    onAcceptSuggestion: (result: AnalysisResult) => void;
    onUpdateSuggestion: (resultId: string, newText: string) => void;
    onDiscardSuggestion: (resultId: string) => void;
    onAnalyzeImages: () => void;
}

const SuggestionCard: React.FC<{
    result: AnalysisResult;
    onAccept: () => void;
    onUpdate: (newText: string) => void;
    onDiscard: () => void;
}> = ({ result, onAccept, onUpdate, onDiscard }) => (
    <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
        <img src={result.imagePreview} alt="suggestion preview" className="w-20 h-20 object-cover rounded-md shadow-sm flex-shrink-0" />
        <input
            type="text"
            value={result.suggestion}
            onChange={(e) => onUpdate(e.target.value)}
            className="flex-grow w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-indigo focus:border-brand-indigo transition duration-150 bg-blue-50 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary focus:bg-blue-100 dark:focus:bg-gray-600"
        />
        <div className="flex gap-2 flex-shrink-0">
            <button onClick={onAccept} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition" aria-label="Aceitar Sugestão">
                <CheckIcon className="h-5 w-5" />
            </button>
            <button onClick={onDiscard} className="p-2 bg-red-500 hover:red-600 text-white rounded-full transition" aria-label="Descartar Sugestão">
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);

export const ImageHandler: React.FC<ImageHandlerProps> = ({ 
    images, 
    setImages, 
    isLoading, 
    analysisResults, 
    hiddenResultsCount,
    onShowResults,
    onAcceptSuggestion, 
    onUpdateSuggestion, 
    onDiscardSuggestion,
    onAnalyzeImages
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [loadingMessage, setLoadingMessage] = useState("Analisando Imagens com IA...");

    useEffect(() => {
        if (isLoading) {
            const messages = [
                "Analisando imagens com IA...",
                "Processando elementos das imagens...",
                "Executando análise inteligente...",
                "Muitos elementos precisam de mais tempo. Acelerando...",
                "Analisando com calma para garantir precisão..."
            ];
            let messageIndex = 0;
            setLoadingMessage(messages[0]);

            const intervalId = setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2500);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [isLoading]);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const convertImageToJPEG = (file: File): Promise<ImageFile> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (!event.target?.result) {
                        return reject(new Error('Could not read file.'));
                    }
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // Resize image to a max dimension for performance and to meet API limits
                        const MAX_DIMENSION = 1024;
                        let { width, height } = img;

                        if (width > height) {
                            if (width > MAX_DIMENSION) {
                                height = Math.round(height * (MAX_DIMENSION / width));
                                width = MAX_DIMENSION;
                            }
                        } else {
                            if (height > MAX_DIMENSION) {
                                width = Math.round(width * (MAX_DIMENSION / height));
                                height = MAX_DIMENSION;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return reject(new Error('Could not get canvas context.'));
                        }
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to JPEG. This is a robust format supported everywhere.
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Quality 90%

                        resolve({
                            id: `${file.name}-${Date.now()}`,
                            dataUrl: dataUrl,
                        });
                    };
                    img.onerror = () => {
                        reject(new Error(`O navegador não conseguiu ler o arquivo de imagem: ${file.name}. O formato pode não ser suportado. Tente converter para JPG ou PNG.`));
                    };
                    img.src = event.target.result as string;
                };
                reader.onerror = () => {
                    reject(new Error(`Erro ao ler o arquivo: ${file.name}.`));
                };
                reader.readAsDataURL(file);
            });
        };

        const newImagePromises = Array.from(files).map(file => 
            convertImageToJPEG(file).catch(error => {
                console.error(error);
                alert(error.message);
                return null; // Return null for failed conversions so Promise.all doesn't fail
            })
        );
        
        Promise.all(newImagePromises).then(newImages => {
            const successfulImages = newImages.filter((img): img is ImageFile => img !== null);
            if (successfulImages.length > 0) {
                setImages(prev => [...prev, ...successfulImages]);
            }
        });
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(image => image.id !== id));
    };

    const renderAIButton = () => {
        if (isLoading) {
            return (
                <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-brand-indigo-light text-white font-bold py-3 px-4 rounded-xl transition duration-300 opacity-75"
                >
                    <AnalyzingStarsIcon className="h-6 w-6" />
                    {loadingMessage}
                </button>
            );
        }
        
        if (hiddenResultsCount > 0 && analysisResults.length === 0) {
            return (
                 <button
                    onClick={onShowResults}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg animate-gradient-x"
                >
                    <SparklesIcon className="h-5 w-5" />
                    Ver Sugestões da IA ({hiddenResultsCount})
                </button>
            );
        }

        if (analysisResults.length > 0) {
            return null; // Button disappears once results are shown
        }

        return (
            <button
                onClick={onAnalyzeImages}
                disabled={images.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand-indigo hover:bg-brand-indigo-light text-white font-bold py-3 px-4 rounded-xl transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <SparklesIcon className="h-5 w-5" />
                Analisar Imagens com IA
            </button>
        );
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
                <CameraIcon className="h-6 w-6 text-brand-indigo" />
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Fotos do Dia</h2>
            </div>
            <div className="border-b-2 border-light-bg dark:border-dark-border my-3"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={e => handleFiles(e.target.files)} className="hidden" />
                <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300"
                >
                    <CameraIcon className="h-5 w-5" />
                    Tirar Foto
                </button>
                <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300"
                >
                    <UploadIcon className="h-5 w-5" />
                    Carregar Fotos
                </button>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    {images.map(image => (
                        <div key={image.id} className="relative group aspect-square">
                            <img src={image.dataUrl} alt="preview" className="w-full h-full object-cover rounded-xl shadow-md" />
                            <button
                                onClick={() => removeImage(image.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="my-4">
                {renderAIButton()}
            </div>

            {analysisResults.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">Sugestões da IA</h3>
                    <div className="space-y-3">
                        {analysisResults.map(result => (
                            <SuggestionCard
                                key={result.id}
                                result={result}
                                onAccept={() => onAcceptSuggestion(result)}
                                onUpdate={(newText) => onUpdateSuggestion(result.id, newText)}
                                onDiscard={() => onDiscardSuggestion(result.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};