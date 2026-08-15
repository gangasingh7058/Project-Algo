import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { languageRegistry } from '../languages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const out_path = path.join(__dirname, 'executable');

if (!fs.existsSync(out_path)) {
  fs.mkdirSync(out_path, { recursive: true });
}

const TIME_LIMIT_MS = 3000;

const runcode = async (filepath, input_path, mode, language) => {
  const ext = path.extname(filepath).toLowerCase();
  let createdFiles = [];

  try {
    const handler = languageRegistry.getHandler(language || ext);
    const { command, args, createdFiles: langCreatedFiles } = await handler.prepare(filepath, out_path);
    if (langCreatedFiles) {
      createdFiles = langCreatedFiles;
    }

    const child = spawn(command, args || [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return await new Promise((resolve) => {
      let input = '';
      if (input_path && fs.existsSync(input_path)) {
        input = fs.readFileSync(input_path, 'utf-8');
      }

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timer = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, TIME_LIMIT_MS);

      try {
        child.stdin.write(input);
        child.stdin.end();
      } catch {}

      child.stdin.on('error', () => {}); // prevent EPIPE

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', () => {
        clearTimeout(timer);
        if (killed) {
          resolve({
            output: 'Time Limit Exceeded',
            error: 'Time Limit Exceeded (Execution took longer than 3000ms)',
          });
        } else if (stderr && stderr.trim()) {
          resolve({
            output: stdout ? stdout.trim() : 'Runtime Error',
            error: stderr.trim(),
          });
        } else {
          resolve({
            output: stdout ? stdout : 'No Output',
            error: null,
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          output: 'Execution Error',
          error: err ? (err.message || String(err)) : 'Internal execution error',
        });
      });
    });
  } catch (err) {
    const errorDetails = (err.stderr && err.stderr.trim()) || (err.stdout && err.stdout.trim()) || err.message || 'Compilation or runtime error';
    return {
      output: 'Compilation Failed',
      error: errorDetails,
    };
  } finally {
    try { fs.rmSync(filepath, { force: true }); } catch {}
    for (const file of createdFiles) {
      if (file) {
        try { fs.rmSync(file, { recursive: true, force: true }); } catch {}
      }
    }
    const parentDir = path.dirname(filepath);
    const codesPath = path.join(__dirname, 'codes');
    if (parentDir !== codesPath && parentDir.startsWith(codesPath)) {
      try { fs.rmSync(parentDir, { recursive: true, force: true }); } catch {}
    }
    try {
      if (input_path && fs.existsSync(input_path)) {
        fs.rmSync(input_path, { force: true });
      }
    } catch {}
  }
};

export default runcode;

