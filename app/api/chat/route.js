import { z } from 'zod';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import dataAnalysisAgent from '@/lib/langchainAgent';
import { getFileData } from '@/lib/serverState';

export async function POST(req) {
  const { messages, userId } = await req.json();
  const fileData = await getFileData();
  let systemPrompt = `You are a helpful assistant that good at data analysis.`;
  if(fileData){
    systemPrompt += systemPrompt += `
      You MUST follow these rules:

      1. This is a DATA ANALYSIS request.
      2. You MUST first call generateAnalysisFunction to create a JavaScript function named 'analyze'.
      3. Then call dataAnalysis with the returned analysisFunction to get the final results.
      4. Do NOT analyze sample data directly. Only generate function first.

      User data sample (for schema inference only):
      ${JSON.stringify(fileData.slice(0, 5), null, 2)}

      The sample is NOT the full data.
      DO NOT analyze the sample.
      DO NOT show 'key' field to the user.
    `;
  } else {
    systemPrompt += ` The user has not provided any files for context. Just tip them to upload file.`;
  }
  const result = streamText({
    model: 'openai/gpt-4o',
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    tools: {
        generateAnalysisFunction: tool({
            description: `
              Generate a PURE JavaScript function named "analyze".

              The function:
              - accepts userData as input
              - answers the data analysis question
              - uses ONLY standard Array / Math APIs
              - does NOT use the data sample
              - does NOT explain, ONLY returns code
            `,
            inputSchema: z.object({
                dataAnalysisQuestion: z.string().describe('The data analysis question to answer'),
                userDataSchema: z.string().describe('The user data schema in JSON format'),
            }),
            execute: async ({ dataAnalysisQuestion, userDataSchema }) => {
                const response = await dataAnalysisAgent.invoke({ 
                  messages: [
                    { 
                      role: "user", 
                      content:  `
                      Question:
                      ${dataAnalysisQuestion}

                      Schema: 
                      ${userDataSchema}
                    ` }
                  ]
                },
                {configurable: { thread_id: "1" },context: { user_id: userId }});
                return response.messages.at(-1).content;
            },
        }),
        dataAnalysis : tool({
          description: 'Execute a generated analysis function on user data',
          inputSchema: z.object({
            analysisFunction: z.string().describe('JavaScript function code returned by generateAnalysisFunction'),
          }),
          execute: async ({ analysisFunction }) => {
            try {
              const fn = new Function(`${analysisFunction}; return analyze;`)();
              const result = fn(fileData);
              return result;
            } catch (err) {
              console.error('Error executing analysis function:', err);
              return { error: 'Failed to execute analysis function', details: err.message };
            }
          },
        }),
    },
    stopWhen: stepCountIs(8),
  });
  return result.toUIMessageStreamResponse();
}