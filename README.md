# AI-powered CSV Data Explorer (Demo)

This project is a **Next.js-based demo application** that allows users to:

- Upload CSV files and visualize the data in an interactive table  
- Edit data directly on the client side  
- Ask questions about the data through an AI chat interface  
- See **how AI reasons about the data step by step**

The project demonstrates how to build a **multi-agent AI system** using **Vercel AI SDK + LangChain / LangGraph**, tightly integrated with a modern React frontend.

---

## Tech Stack

### Frontend

- **React**  
  Used for client-side rendering and UI composition.

- **Ant Design (antd)**  
  A React-based UI component library, mainly used for rendering interactive data tables (sorting, editing, filtering).

- **Tailwind CSS**  
  Utility-first CSS framework for styling and layout.

- **Vercel AI SDK**  
  - Renders the AI chat UI  
  - Handles LLM calls  
  - Manages tool invocation  
  - Streams AI responses between server and client  

### Backend

- **Next.js (App Router)**  
  Provides server-side endpoints for:
  - File upload (CSV)
  - Data modification
  - AI chat requests

- **LangChain & LangGraph**  
  Used as **sub-agents** to:
  - Perform LLM calls
  - Generate executable analysis logic  
  - Collaborate with the **supervisor agent** provided by Vercel AI SDK  

This setup demonstrates how **Vercel AI SDK can seamlessly integrate with LangChain/LangGraph** to build a multi-agent system.

---

## Core Design & Architecture

### High-level Idea

1. **Next.js** acts as the backend service layer.
2. **React + Ant Design + Tailwind** render an interactive data table.
3. **Vercel AI SDK** manages the AI chat experience.
4. User data is stored **in server memory** as a large JSON array (for simplicity).

> ⚠️ This is a demo project.  
> To reduce complexity, no database or Redis is used. All data lives in the server process memory.

---

### Data Flow When Asking AI Questions

When a user asks a question about the data in the chat window, the following happens:

1. **Generate an executable analysis function (key step)**  
   - Based on:
     - The user’s natural language question
     - **5 sample records** from the large JSON dataset  
   - An LLM generates **executable JavaScript function code** that describes how to analyze the data.
   - This step is handled by a **LangChain sub-agent**, intentionally included to demonstrate a multi-agent architecture.

2. **Execute the generated function**  
   - The full user dataset (large JSON array) is passed as a parameter to the generated function.
   - The function executes on the server and returns the final answer.

3. **Transparent reasoning**  
   - Both:
     - The generated function
     - The execution result  
   - Are streamed and displayed in the client chat UI, so users can see **what happens behind the scenes**.

---

## What This Demo Supports

- Upload CSV files and instantly visualize data
- Inline editing of table data
- Conversational data analysis using AI
- Multi-agent AI orchestration
- Streaming AI responses with intermediate steps

---

## Future Improvements

This project is intentionally simplified, but it is designed to be extended. Possible next steps include:

1. **PostgreSQL integration**  
   - Persist uploaded CSV data in a database  
   - Sync all client-side edits (create / update / delete) to PostgreSQL  

2. **SQL-based AI analysis**  
   - Instead of generating executable JavaScript functions, the AI generates **read-only SQL queries**
   - Enforce strict safety rules:
     - Only `SELECT` statements
     - No `INSERT`, `UPDATE`, or `DELETE`
   - Execute SQL queries and return results to the user

3. **Docker & CI/CD**  
   - Write a Dockerfile for the Next.js app  
   - Use GitHub Actions to:
     - Build Docker images on commit
     - Push images to Docker Hub  

4. **Caching & Background Jobs**  
   - Add **Redis** for caching  
   - Add **BullMQ** for job queues and async tasks  

5. **Docker Compose Setup**  
   - Include:
     - Next.js app
     - PostgreSQL
     - Nginx
     - Redis
     - BullMQ worker  
   - Enable one-command local deployment

---

## Running the Project Locally

### Prerequisites

1. Install **Node.js**
2. Install **pnpm**

### Steps

1. Install dependencies:

```bash
pnpm install
```

2. Open the file `/lib/langchainAgents.ts`, replace the following configuration with your own OpenAI credentials:

```bash
const llm = new AzureChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  maxRetries: 2,
  azureOpenAIApiKey: "<YOUR_AZURE_API_KEY>",
  azureOpenAIApiInstanceName: "your-azure-openai-instance",
  azureOpenAIApiDeploymentName: "gpt-4o",
  azureOpenAIApiVersion: "your-azure-openai-version",
});
```

3. Start the development server:
   
```bash
pnpm dev
```

4. Open your browser:
   
```bash
http://localhost:3000
```
