import path from 'path';
import { exec as rawExec } from 'child_process';
import { promisify } from 'util';
import { BaseLanguage } from './BaseLanguage.js';

const exec = promisify(rawExec);

export class CppLanguage extends BaseLanguage {
  constructor() {
    super('cpp', ['cpp', 'c++', 'c'], 'cpp');
  }

  async prepare(filepath, outPath) {
    const outputName = path.basename(filepath).split('.')[0];
    const outFilePath = path.join(outPath, `${outputName}.exe`);
    
    await exec(`g++ "${filepath}" -o "${outFilePath}"`);
    
    return {
      command: outFilePath,
      args: [],
      createdFiles: [outFilePath]
    };
  }
}
