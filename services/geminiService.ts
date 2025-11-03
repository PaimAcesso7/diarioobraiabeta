import { GoogleGenAI } from "@google/genai";
import { ImageFile, AnalysisResult, Task } from '../types';

// Per guidelines, API key is sourced from environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});

// Function to convert dataURL to a gemini-compatible part
const fileToGenerativePart = (dataUrl: string) => {
    // Fix: Correctly parse base64 data URL
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid data URL');
    }
    const mimeType = match[1];
    const data = match[2];
    return {
        inlineData: {
            mimeType,
            data
        },
    };
};

export const generateTaskDescriptionFromImages = async (images: ImageFile[], taskHistory: string[]): Promise<AnalysisResult[]> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY is not set.");
        // Fail gracefully if API key is not available
        return [];
    }
    
    // Use a model capable of processing both text and images
    const model = 'gemini-2.5-flash';

    const results: AnalysisResult[] = [];

    for (const image of images) {
        try {
            const imagePart = fileToGenerativePart(image.dataUrl);
            const textPart = {
                text: `Analise esta imagem de uma obra. Descreva em uma frase curta e objetiva uma atividade de construção civil que está sendo realizada ou que é representada na imagem. Foque em ações e objetos. Exemplo: "Instalação de formas para viga". Se a imagem não for clara ou não representar uma atividade, retorne "Não foi possível identificar". Histórico de tarefas recentes para evitar duplicatas: ${taskHistory.slice(0, 5).join(', ')}`
            };
            
            const response = await ai.models.generateContent({
                model: model,
                contents: [{ parts: [imagePart, textPart] }],
            });

            const suggestion = response.text.trim();
            
            if (suggestion && !suggestion.includes("Não foi possível identificar")) {
                results.push({
                    id: `result-${image.id}`,
                    imageId: image.id,
                    imagePreview: image.dataUrl,
                    suggestion: suggestion.replace(/["\.]/g, ''), // Clean up quotes and periods
                });
            }
        } catch (error) {
            console.error(`Error processing image ${image.id}:`, error);
        }
    }
    return results;
};


export const suggestLocationForTask = async (taskText: string, taskHistory: Task[]): Promise<string> => {
     if (!process.env.API_KEY) {
        console.error("API_KEY is not set.");
        return "";
    }
    
    const model = 'gemini-2.5-flash';

    const historyPrompt = taskHistory
        .slice(0, 10) // Limit history to recent 10 tasks for context relevance
        .map(t => `- "${t.text}" no local "${t.location}"`)
        .join('\n');

    const prompt = `Baseado no histórico de tarefas e seus locais, sugira um local provável para a nova tarefa. Retorne apenas o nome do local (ex: "Térreo", "1º Andar - Apartamento 101", "Fachada Leste"). Se não tiver certeza, retorne uma string vazia.
    
    Histórico:
    ${historyPrompt}
    
    Nova Tarefa: "${taskText}"
    
    Local Sugerido:`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting location:", error);
        return ""; // Fail silently on error as per component's expectation
    }
};

export const generateProjectInsights = async (processedDataSummary: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY is not set.");
        return "API Key não configurada.";
    }

    // Use a more capable model for analytical tasks
    const model = 'gemini-2.5-pro';

    const prompt = `Você é um assistente de engenharia civil analisando dados de um diário de obras. Com base no resumo a seguir, gere 3 a 5 insights acionáveis em formato de bullet points. Foque em produtividade, riscos, e sugestões de melhoria. Seja conciso e direto.

    Resumo dos Dados:
    ${processedDataSummary}

    Exemplo de Saída:
    * **Risco de Atraso:** A tarefa 'Alvenaria do 2º Andar' está bloqueada há múltiplos dias. Verifique a causa raiz (falta de material, mão de obra) para evitar impacto no cronograma.
    * **Oportunidade de Melhoria:** A produtividade aumentou 15% na última semana. Investigue se a alocação de equipes ou o clima favorável foram os fatores principais para replicar o sucesso.
    * **Ponto de Atenção:** O alto número de dias de chuva impactou as atividades externas. Considere planejar tarefas internas para os próximos dias com previsão de chuva para mitigar perdas.

    Insights (use markdown com asteriscos para bullet points):`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating insights:", error);
        throw new Error("Falha ao gerar insights. Tente novamente mais tarde.");
    }
};
