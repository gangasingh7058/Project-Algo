import fs from 'fs';
import path from 'path';
import { exec as execute } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const exec = promisify(execute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const out_path = path.join(__dirname, 'executable');

if (!fs.existsSync(out_path)) {
    fs.mkdirSync(out_path, { recursive: true });
}

const runcode = async (filepath, input_path, mode) => {
    const output_name = path.basename(filepath).split('.')[0];
    const out_file_path = path.join(out_path, `${output_name}.exe`);

    try {
        // Step 1: Compile
        await exec(`g++ "${filepath}" -o "${out_file_path}"`);

        // Step 2: Determine input redirection only if input exists
        let runCommand = `"${out_file_path}"`;

        const hasInput =
            input_path &&
            fs.existsSync(input_path) &&
            fs.readFileSync(input_path, 'utf-8').trim() !== '';

        if (hasInput) {
            runCommand += ` < "${input_path}"`;
        }

        // Step 3: Run the executable
        const { stdout } = await exec(runCommand);

        return { output: stdout };
    } catch (err) {
        return { error: err.stderr || err.message };
    } finally {
        if (mode == 'compiler') {
            try { fs.rmSync(filepath, { force: true }); } catch {}
            try { fs.rmSync(out_file_path, { force: true }); } catch {}
            try {
                if (input_path && fs.existsSync(input_path)) {
                    fs.rmSync(input_path, { force: true });
                }
            } catch {}
        }
    }
};

export default runcode;
