import * as z from "zod";
import { AzureChatOpenAI } from "@langchain/openai";
import { createAgent, tool, type ToolRuntime } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { de } from "zod/v4/locales";
import { getFileData } from '@/lib/serverState';

const llm = new AzureChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  maxRetries: 2,
  azureOpenAIApiKey: "<YOUR_AZURE_API_KEY>",
  azureOpenAIApiInstanceName: "your-azure-openai-instance", 
  azureOpenAIApiDeploymentName: "gpt-4o",
  azureOpenAIApiVersion: "your-azure-openai-version",
});

const systemPrompt = `
You are a senior data analyst and JavaScript expert.

You DO NOT have access to raw data.
You will be given:
- a data schema
- a user question

Your job is to generate a PURE JavaScript function named "analyze"
that:
- takes userData as input
- returns the answer to the question
- does NOT use external libraries
- does NOT mutate input
- uses only standard Array / Math methods

Return ONLY valid JavaScript code.
`;

const dataAnalysisAgent = createAgent({
  model: llm,
  systemPrompt,
  checkpointer: new MemorySaver(),
});

export default dataAnalysisAgent;