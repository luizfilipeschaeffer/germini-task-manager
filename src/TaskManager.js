import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

class TaskManager {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });
  }

  async generateTasks(prompt, maxTasks = 10) {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Atue como um especialista em gerenciamento de projetos de software.
            Com base no seguinte prompt, gere uma lista de até ${maxTasks} tasks para implementação:
            
            ${prompt}
            
            Responda em formato JSON com a seguinte estrutura:
            {
              "tasks": [
                {
                  "id": number,
                  "title": string,
                  "description": string,
                  "priority": "high" | "medium" | "low",
                  "dependencies": number[],
                  "status": "pending"
                }
              ]
            }`
          }]
        }]
      });

      const response = await result.response;
      const jsonStr = response.text().match(/\{[\s\S]*\}/)[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Erro ao gerar tasks:', error);
      return { tasks: [] };
    }
  }

  async expandTask(taskId, task, numSubtasks = 3, prompt = '') {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Atue como um especialista em desenvolvimento de software.
            Com base na seguinte task, gere ${numSubtasks} subtasks detalhadas para implementação:
            
            Task: ${task.title}
            Descrição: ${task.description}
            ${prompt ? 'Contexto adicional: ' + prompt : ''}
            
            Responda em formato JSON com a seguinte estrutura:
            {
              "subtasks": [
                {
                  "id": "${taskId}.1",
                  "title": string,
                  "description": string,
                  "priority": "high" | "medium" | "low",
                  "status": "pending"
                }
              ]
            }`
          }]
        }]
      });

      const response = await result.response;
      const jsonStr = response.text().match(/\{[\s\S]*\}/)[0];
      return JSON.parse(jsonStr).subtasks;
    } catch (error) {
      console.error('Erro ao expandir task:', error);
      return [];
    }
  }

  async analyzeTask(task) {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Atue como um especialista em desenvolvimento de software.
            Analise a seguinte task e forneça insights detalhados:
            
            Task: ${task.title}
            Descrição: ${task.description}
            Status: ${task.status}
            Prioridade: ${task.priority}
            
            Por favor, forneça:
            1. Análise detalhada dos requisitos
            2. Sugestões de implementação
            3. Possíveis desafios e soluções
            4. Estimativa de complexidade
            5. Recomendações de subtasks se necessário`
          }]
        }]
      });

      const response = await result.response;
      return {
        success: true,
        response: response.text()
      };
    } catch (error) {
      console.error('Erro ao analisar task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default TaskManager; 