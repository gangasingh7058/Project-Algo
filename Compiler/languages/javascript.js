import { BaseLanguage } from './BaseLanguage.js';

export class JavascriptLanguage extends BaseLanguage {
  constructor() {
    super('javascript', ['javascript', 'js', 'node', 'nodejs'], 'js');
  }

  async prepare(filepath, outPath) {
    return {
      command: 'node',
      args: [filepath],
      createdFiles: []
    };
  }
}
