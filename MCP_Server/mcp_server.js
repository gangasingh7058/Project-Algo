import dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";


const COMPILER_URL = (process.env.COMPILER_URL).replace(/[;/]+$/, "");

// ============================================================
// MCP SERVER FACTORY
// ============================================================

/**
 * Creates a fresh McpServer instance with all tools registered.
 * Each SSE / Streamable HTTP session gets its own server instance
 * so sessions are fully independent.
 */
export function createMcpServer() {
    const server = new McpServer({
        name: "code-compiler-server",
        version: "1.0.0"
    });

    // ----------------------------------------------------------
    // Tool: run_code
    // ----------------------------------------------------------
    server.tool(
        "run_code",
        "Compiles and executes source code in supported programming languages (e.g. cpp, python, javascript) with optional stdin inputs and returns the execution output or error message.",
        {
            language: z.string().describe("Target programming language (e.g., 'cpp', 'python', 'javascript')"),
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
                    timeout: 10000
                });

                const data = response.data;

                if (data.success) {
                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ success: true, verdict: data.verdict }, null, 2)
                        }]
                    };
                } else {
                    return {
                        isError: true,
                        content: [{
                            type: "text",
                            text: JSON.stringify({
                                success: false,
                                verdict: data.verdict || "Execution failed",
                                error: data.error || data.err || null
                            }, null, 2)
                        }]
                    };
                }
            } catch (err) {
                const errorMsg = err.response?.data?.error
                    || err.response?.data?.err
                    || err.message
                    || "Failed to connect to compiler backend service.";

                return {
                    isError: true,
                    content: [{
                        type: "text",
                        text: JSON.stringify({ success: false, error: errorMsg }, null, 2)
                    }]
                };
            }
        }
    );

    // ----------------------------------------------------------
    // Tool: check_compiler_status
    // ----------------------------------------------------------
    server.tool(
        "check_compiler_status",
        "Checks if the Code Compiler microservice is online and reachable.",
        {},
        async () => {
            try {
                const response = await axios.get(`${COMPILER_URL}/health`, { timeout: 3000 });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: typeof response.data === "string"
                                ? response.data.replace(/<[^>]*>/g, "").trim()
                                : "Compiler service is online"
                        }, null, 2)
                    }]
                };
            } catch (err) {
                return {
                    isError: true,
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: err.message || "Compiler service is unreachable"
                        }, null, 2)
                    }]
                };
            }
        }
    );

    return server;
}
