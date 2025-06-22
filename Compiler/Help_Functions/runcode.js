import fs from 'fs';
import path from 'path';
import { exec as execute } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const out_path = path.join(__dirname, 'executable');

// Ensure output directory exists
if (!fs.existsSync(out_path)) {
    fs.mkdirSync(out_path, { recursive: true });
}

const runcode = (filepath) => {
    const output_name = path.parse(filepath).name;
    const out_file_path = path.join(out_path, `${output_name}.exe`);

    return new Promise((resolve, reject) => {
        // Step 1: Compile
        execute(`g++ ${filepath} -o ${out_file_path}`, (err, stdout, stderr) => {
            if (err) {
                // Delete the source file if compilation fails
                try {
                    fs.rmSync(filepath);
                } catch (e) {
                    console.error("Cleanup failed (compile):", e.message);
                }
                return reject({ error: stderr });
            }

            // Step 2: Run compiled executable
            execute(`${out_file_path}`, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    // Delete the source file if execution fails
                    try {
                        fs.rmSync(filepath);
                    } catch (e) {
                        console.error("Cleanup failed (runtime):", e.message);
                    }
                    return reject({ error: runStderr });
                }

                return resolve({ output: runStdout });
            });
        });
    });
};

export default runcode;
