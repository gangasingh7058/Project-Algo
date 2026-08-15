import { exec as rawExec } from 'child_process';
import { promisify } from 'util';
import { BaseLanguage } from './BaseLanguage.js';

const exec = promisify(rawExec);

export class PythonLanguage extends BaseLanguage {
  constructor() {
    super('python', ['python', 'py', 'py3', 'python3'], 'py');
  }

  getPythonCmd() {
    if (process.env.PYTHON_CMD) return process.env.PYTHON_CMD;
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  async prepare(filepath, outPath) {
    const pythonCmd = this.getPythonCmd();
    await exec(`"${pythonCmd}" -m py_compile "${filepath}"`);

    return {
      command: pythonCmd,
      args: ['-B', filepath],
      createdFiles: []
    };
  }
}
