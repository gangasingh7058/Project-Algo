import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const COMPILER_URL = (process.env.COMPILER_URL || "http://localhost:3002").replace(/[;/]+$/, "");

// Initialize MCP Server
const server = new McpServer({
    name: "code-compiler-server",
    version: "1.0.0"
});

// ============================================================
// TOOLS
// ============================================================

/*
 * Tool: run_code
 * Compiles and executes source code in C++ or Python.
 */
server.tool(
    "run_code",
    "Compiles and executes code in programming languages (cpp, python) with optional input data and returns the execution result, output, or error messages.",

    // Input Validation
    {
        language: z.string().describe("Target language (e.g., 'cpp', 'python')"),
        code: z.string().describe("Source code to be compiled and executed"),
        inputs: z.string().optional().default("").describe("Standard input (stdin) for the program"),
    },
    async ({ language, code, inputs }) => {
        try {
            // Unescape literal \n / \t and format preprocessor directives (e.g. #include)
            let formattedCode = code
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\t/g, "\t");

            if (language.toLowerCase() === "cpp" || language.toLowerCase() === "c") {
                formattedCode = formattedCode.replace(/(#(?:include\s*<[^>]+>|include\s*"[^"]+"|define\s+[^\n]+|pragma\s+[^\n]+))/g, "$1\n");
            }

            const response = await axios.post(`${COMPILER_URL}/run`, {
                language,
                code: formattedCode,
                inputs: (inputs || "").replace(/\\n/g, "\n"),
                mode: "MCP"
            }, {
                timeout: 10000 // 10s HTTP timeout
            });

            const data = response.data;

            if (data.success) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                verdict: data.verdict
                            }, null, 2)
                        }
                    ]
                };
            } else {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: false,
                                verdict: data.verdict || "Execution failed",
                                error: data.error || data.err || null
                            }, null, 2)
                        }
                    ]
                };
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error
                || err.response?.data?.err
                || err.message
                || "Failed to connect to compiler backend service.";

            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: errorMsg
                        }, null, 2)
                    }
                ]
            };
        }
    }
);

/*
 * Tool: check_compiler_status
 * Checks health and connectivity of the Compiler API microservice.
 */
server.tool(
    "check_compiler_status",
    "Checks if the Code Compiler microservice is online and reachable.",
    {},
    async () => {
        try {
            const response = await axios.get(`${COMPILER_URL}/`, { timeout: 3000 });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: typeof response.data === "string" ? response.data.replace(/<[^>]*>/g, "").trim() : "Compiler service is online"
                        }, null, 2)
                    }
                ]
            };
        } catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: err.message || "Compiler service is unreachable"
                        }, null, 2)
                    }
                ]
            };
        }
    }
);


// ============================================================
// MAIN ENTRY POINT
// ============================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Code Compiler MCP Server is running on stdio transport");
}

main().catch((error) => {
    console.error("Fatal error starting Code Compiler MCP Server:", error);
    process.exit(1);
});

