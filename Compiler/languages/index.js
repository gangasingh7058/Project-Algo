import { CppLanguage } from './cpp.js';
import { PythonLanguage } from './python.js';
import { JavascriptLanguage } from './javascript.js';

class LanguageRegistry {
  constructor() {
    this.handlers = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register(new CppLanguage());
    this.register(new PythonLanguage());
    this.register(new JavascriptLanguage());
  }

  /**
   * Register a new language handler strategy
   * @param {import('./BaseLanguage.js').BaseLanguage} languageHandler 
   */
  register(languageHandler) {
    for (const alias of languageHandler.aliases) {
      this.handlers.set(alias.toLowerCase(), languageHandler);
    }
  }

  /**
   * Get handler for a given language name or file extension
   * @param {string} languageOrExt 
   */
  getHandler(languageOrExt) {
    if (!languageOrExt) {
      return this.handlers.get('cpp');
    }
    const normalized = String(languageOrExt).toLowerCase().replace(/^\./, '').trim();
    const handler = this.handlers.get(normalized);
    if (!handler) {
      throw new Error(`Unsupported or unknown language: '${languageOrExt}'`);
    }
    return handler;
  }
}

export const languageRegistry = new LanguageRegistry();
export { BaseLanguage } from './BaseLanguage.js';
