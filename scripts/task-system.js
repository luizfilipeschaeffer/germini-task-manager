import { program } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import fs from 'fs';
import TaskManager from '../src/TaskManager.js';

// Funções auxiliares
function startLoadingIndicator(text) {
  const spinner = ora(text).start();
  return spinner;
}

function stopLoadingIndicator(spinner) {
  if (spinner) spinner.stop();
}

function writeJSON(filePath, data) {
  try {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever arquivo:', error);
    return false;
  }
}

function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tasks: [] };
  }
}

function findTaskById(tasks, id) {
  return tasks.find(task => task.id === parseInt(id));
}

// Inicializar o TaskManager
const taskManager = new TaskManager();

// Comandos
program
  .name('task-system')
  .description('Sistema de gerenciamento de tasks usando Gemini')
  .version('1.0.0');

program
  .command('create')
  .description('Criar novas tasks a partir de um prompt')
  .argument('<prompt>', 'Descrição da task')
  .option('--tasks <number>', 'Número máximo de tasks', parseInt, 10)
  .action(async (prompt, options) => {
    const spinner = startLoadingIndicator('Gerando tasks com Gemini...');
    
    try {
      const result = await taskManager.generateTasks(prompt, options.tasks);
      stopLoadingIndicator(spinner);
      
      if (result.tasks && result.tasks.length > 0) {
        writeJSON('tasks/tasks.json', result);
        console.log(chalk.green(`\n✅ ${result.tasks.length} tasks geradas com sucesso!`));
        
        // Mostrar as tasks geradas
        console.log('\nTasks geradas:');
        result.tasks.forEach(task => {
          console.log(chalk.cyan(`\n[${task.id}] ${task.title}`));
          console.log(chalk.gray(task.description));
          console.log(chalk.yellow(`Prioridade: ${task.priority}`));
          if (task.dependencies.length > 0) {
            console.log(chalk.magenta(`Dependências: ${task.dependencies.join(', ')}`));
          }
        });
      } else {
        console.error(chalk.red('\n❌ Erro ao gerar tasks.'));
      }
    } catch (error) {
      stopLoadingIndicator(spinner);
      console.error(chalk.red('\n❌ Erro ao gerar tasks:', error.message));
    }
  });

program
  .command('expand')
  .description('Expandir uma task em subtasks')
  .requiredOption('--id <id>', 'ID da task')
  .option('--num <number>', 'Número de subtasks', parseInt, 3)
  .option('--prompt <text>', 'Contexto adicional')
  .action(async (options) => {
    const spinner = startLoadingIndicator('Expandindo task...');
    
    try {
      const tasksData = readJSON('tasks/tasks.json');
      const task = findTaskById(tasksData.tasks, options.id);
      
      if (!task) {
        stopLoadingIndicator(spinner);
        console.error(chalk.red(`Task com ID ${options.id} não encontrada.`));
        return;
      }
      
      const subtasks = await taskManager.expandTask(options.id, task, options.num, options.prompt);
      stopLoadingIndicator(spinner);
      
      if (subtasks && subtasks.length > 0) {
        task.subtasks = subtasks;
        writeJSON('tasks/tasks.json', tasksData);
        console.log(chalk.green(`\n✅ ${subtasks.length} subtasks geradas com sucesso!`));
        
        // Mostrar as subtasks geradas
        console.log('\nSubtasks geradas:');
        subtasks.forEach(subtask => {
          console.log(chalk.cyan(`\n[${subtask.id}] ${subtask.title}`));
          console.log(chalk.gray(subtask.description));
          console.log(chalk.yellow(`Prioridade: ${subtask.priority}`));
        });
      } else {
        console.error(chalk.red('\n❌ Erro ao gerar subtasks.'));
      }
    } catch (error) {
      stopLoadingIndicator(spinner);
      console.error(chalk.red('\n❌ Erro ao expandir task:', error.message));
    }
  });

program
  .command('analyze')
  .description('Analisar uma task')
  .requiredOption('--id <id>', 'ID da task')
  .action(async (options) => {
    const spinner = startLoadingIndicator('Analisando task...');
    
    try {
      const tasksData = readJSON('tasks/tasks.json');
      const task = findTaskById(tasksData.tasks, options.id);
      
      if (!task) {
        stopLoadingIndicator(spinner);
        console.error(chalk.red(`Task com ID ${options.id} não encontrada.`));
        return;
      }
      
      const result = await taskManager.analyzeTask(task);
      stopLoadingIndicator(spinner);
      
      if (result.success) {
        console.log('\n' + boxen(chalk.cyan('=== Análise do Gemini ===\n\n') + 
          result.response + '\n', 
          { padding: 1, borderColor: 'cyan' }));
      } else {
        console.error(chalk.red('\n❌ Erro na análise:', result.error));
      }
    } catch (error) {
      stopLoadingIndicator(spinner);
      console.error(chalk.red('\n❌ Erro ao analisar task:', error.message));
    }
  });

program
  .command('list')
  .description('Listar todas as tasks')
  .option('--status <status>', 'Filtrar por status')
  .action(async (options) => {
    try {
      const tasksData = readJSON('tasks/tasks.json');
      
      if (!tasksData.tasks || tasksData.tasks.length === 0) {
        console.log(chalk.yellow('\nNenhuma task encontrada.'));
        return;
      }
      
      console.log('\nTasks:');
      tasksData.tasks
        .filter(task => !options.status || task.status === options.status)
        .forEach(task => {
          console.log(chalk.cyan(`\n[${task.id}] ${task.title}`));
          console.log(chalk.gray(task.description));
          console.log(chalk.yellow(`Prioridade: ${task.priority}`));
          console.log(chalk.blue(`Status: ${task.status}`));
          if (task.dependencies.length > 0) {
            console.log(chalk.magenta(`Dependências: ${task.dependencies.join(', ')}`));
          }
          if (task.subtasks && task.subtasks.length > 0) {
            console.log('\nSubtasks:');
            task.subtasks.forEach(subtask => {
              console.log(chalk.cyan(`  [${subtask.id}] ${subtask.title}`));
              console.log(chalk.gray(`    ${subtask.description}`));
              console.log(chalk.yellow(`    Prioridade: ${subtask.priority}`));
            });
          }
        });
    } catch (error) {
      console.error(chalk.red('\n❌ Erro ao listar tasks:', error.message));
    }
  });

program
  .command('set-status')
  .description('Alterar o status de uma task')
  .requiredOption('--id <id>', 'ID da task')
  .requiredOption('--status <status>', 'Novo status')
  .action(async (options) => {
    try {
      const tasksData = readJSON('tasks/tasks.json');
      const task = findTaskById(tasksData.tasks, options.id);
      
      if (!task) {
        console.error(chalk.red(`Task com ID ${options.id} não encontrada.`));
        return;
      }
      
      task.status = options.status;
      writeJSON('tasks/tasks.json', tasksData);
      console.log(chalk.green(`\n✅ Status da task ${options.id} alterado para ${options.status}`));
    } catch (error) {
      console.error(chalk.red('\n❌ Erro ao alterar status:', error.message));
    }
  });

program.parse(process.argv); 