import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { createMcpServer } from "./mcp_server.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || process.env.MCP_PORT || "3003", 10);



const app = express();
app.use(express.json());
app.use(cors());


// Health check

app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "code-compiler-mcp", version: "1.0.0" });
});


// SSE Transport  (/sse  +  /messages)

/** Map of sessionId → { server, transport } */
const sseSessions = new Map();

app.get("/sse", async (req, res) => {
    console.log("[SSE] New SSE connection");

    const transport = new SSEServerTransport("/messages", res);
    const server = createMcpServer();

    sseSessions.set(transport.sessionId, { server, transport });

    // Clean up on disconnect
    res.on("close", () => {
        console.log(`[SSE] Client disconnected (session ${transport.sessionId})`);
        sseSessions.delete(transport.sessionId);
        server.close().catch(() => { });
    });

    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const session = sseSessions.get(sessionId);

    if (!session) {
        res.status(400).json({ error: "No active SSE session for the given sessionId" });
        return;
    }

    await session.transport.handlePostMessage(req, res, req.body);
});



// Streamable HTTP Transport  (/mcp)

const streamableSessions = new Map();

app.post("/mcp", async (req, res) => {
    console.log("[MCP] Streamable HTTP POST /mcp");

    // Check for existing session
    const sessionId = req.headers["mcp-session-id"];
    let session = sessionId ? streamableSessions.get(sessionId) : undefined;

    if (session) {
        // Reuse existing session's transport
        await session.transport.handleRequest(req, res);
        return;
    }

    // Create a new session
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (newSessionId) => {
            console.log(`[MCP] Session initialized: ${newSessionId}`);
            streamableSessions.set(newSessionId, { server: mcpServer, transport });
        }
    });

    // Clean up on session close
    transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
            console.log(`[MCP] Session closed: ${sid}`);
            streamableSessions.delete(sid);
        }
    };

    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);
});

app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    const session = sessionId ? streamableSessions.get(sessionId) : undefined;

    if (!session) {
        res.status(400).json({ error: "No active session. Send an initialize POST first." });
        return;
    }

    await session.transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    const session = sessionId ? streamableSessions.get(sessionId) : undefined;

    if (!session) {
        res.status(400).json({ error: "No active session." });
        return;
    }

    await session.transport.handleRequest(req, res);
});


// START SERVER


const httpServer = app.listen(PORT, () => {
    console.log(`Code Compiler MCP Server is running on HTTP port ${PORT}`);
    console.log(`  SSE endpoint  →  http://0.0.0.0:${PORT}/sse`);
    console.log(`  Streamable    →  http://0.0.0.0:${PORT}/mcp`);
    console.log(`  Health check  →  http://0.0.0.0:${PORT}/health`);
});




// Graceful shutdown
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function shutdown(signal) {
    console.log(`\n[${signal}] Shutting down…`);

    // Close all SSE sessions
    for (const [id, session] of sseSessions) {
        await session.server.close().catch(() => { });
        sseSessions.delete(id);
    }

    // Close all Streamable HTTP sessions
    for (const [id, session] of streamableSessions) {
        await session.server.close().catch(() => { });
        streamableSessions.delete(id);
    }

    httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
}
