import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
    stepCountIs,
    ToolLoopAgent as Agent,
    createUIMessageStream,
    createUIMessageStreamResponse,
    convertToModelMessages,
} from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";


export async function POST(req: Request) {

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    const openRouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_AI_KEY,
    });

    if (!convex || !openRouter) {
        console.error("Convex client or openRouter not initialized");
        return NextResponse.json({ error: "Convex client or openRouter not initialized" }, { status: 500 });
    }

    let model, message, threadId, userId;

    try {
        const body = await req.json();
        model = body.model;
        message = body.message;
        threadId = body.threadId;
        userId = body.userId;
    } catch (error) {
        console.error("Error parsing request:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // See if the thread exisit and is not deleted

    const thread = await convex.query(api.chat.getThread, {
        threadId
    });
    if (!thread) {
        console.error("Thread not found");
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    } else if (thread.deletedAt !== undefined) {
        console.error("Thread is deleted");
        return NextResponse.json({ error: "Thread is deleted" }, { status: 404 });
    }

    // Append users message to the thread
    try {
        await convex.mutation(api.chat.appendMessage, {
            threadId,
            model,
            messageId: crypto.randomUUID(),
            role: "user",
            parts: [{
                type: "text",
                text: message
            }]
        })
    } catch (error) {
        console.error("Error appending message to thread:", error);
        return NextResponse.json({ error: "Error appending message to thread" }, { status: 500 });
    }

    // Get all messages from the thread
    const messages = await convex.query(api.chat.listMessages, {
        threadId
    });
    if (!messages || messages.length === 0) {
        console.error("No messages found");
        return NextResponse.json({ error: "No messages found" }, { status: 404 });
    }

    // Transform messages to Model message format expected by agent.stream
    // Model messages have: { role, content } where content can be string or array
    const modelMessages = await convertToModelMessages(messages.map(msg => ({
        role: msg.role,
        parts: msg.content,
    })));

    const response = createUIMessageStreamResponse({
        status: 200,
        stream: createUIMessageStream({
            execute: async ({ writer }) => {
                const agent = new Agent({
                    model: openRouter(model),
                    instructions: "You are a helpful assistant that can answer questions and help with tasks.",
                    stopWhen: stepCountIs(10),
                    experimental_context: {
                        userId,
                        threadId,
                    },
                })

                const stream = await agent.stream({ messages: modelMessages })
                writer.merge(
                    stream.toUIMessageStream({
                        onFinish: async ({ messages }) => {
                            if (messages.length < 0) {
                                console.error("No messages returned from agent");
                            }

                            const agentMessage = messages[messages.length - 1]


                            // This is where we would add the messages to the database
                            await convex.mutation(api.chat.appendMessage, {
                                threadId,
                                model,
                                messageId: crypto.randomUUID(),
                                role: "assistant",
                                parts: agentMessage.parts
                            })
                        }
                    })
                )
            }
        })
    })
    return response;
}