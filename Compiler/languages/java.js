import path from 'path';
import { exec as rawExec } from 'child_process';
import { promisify } from 'util';
import { BaseLanguage } from './BaseLanguage.js';

const exec = promisify(rawExec);

export class JavaLanguage extends BaseLanguage {
  constructor() {
    super('java', ['java'], 'java');
  }

  async prepare(filepath, outPath) {
    const dir = path.dirname(filepath);
    const filename = path.basename(filepath, '.java');

    await exec(`javac "${filepath}"`);
    const classFile = path.join(dir, `${filename}.class`);

    return {
      command: 'java',
      args: ['-cp', dir, filename],
      createdFiles: [classFile]
    };
  }
}
