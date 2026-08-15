/**
 * Base abstract class for Language Strategy Handlers
 */
export class BaseLanguage {
  /**
   * @param {string} name - Primary name of the language
   * @param {string[]} aliases - List of accepted aliases (lowercase)
   * @param {string} extension - Standard file extension (without dot)
   */
  constructor(name, aliases, extension) {
    this.name = name;
    this.aliases = aliases;
    this.extension = extension;
  }

  /**
   * Prepare code for execution (e.g. compilation step).
   * @param {string} filepath - Path to the source code file
   * @param {string} outPath - Path to build/executable directory
   * @returns {Promise<{ command: string, args: string[], createdFiles?: string[] }>}
   */
  async prepare(filepath, outPath) {
    throw new Error(`prepare() method not implemented for ${this.name}`);
  }
}
