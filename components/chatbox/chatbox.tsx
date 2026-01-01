'use client';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Confirmation, ConfirmationAccepted, ConfirmationAction, ConfirmationActions, ConfirmationRejected, ConfirmationRequest, ConfirmationTitle } from "@/components/ai-elements/confirmation";
import { CheckIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';

const suggestions = [
  'Can you explain how to play tennis?',
  'What is the weather in Tokyo?',
  'How do I make a really good fish taco?',
];

export default function Chatbox() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
        api: '/api/chat',
        headers: () => ({
            Authorization: `Bearer 1234567890`,
        }),
        body: () => ({
            userId: '1',
        }),
        credentials: () => 'include',
    }),
  });
  const handleSubmit = (message,e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="Hi, welcome to the chat!"
                description="How can I help you today?"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        case 'tool-generateAnalysisFunction':
                        case 'tool-dataAnalysis':
                          return (
                            <Tool defaultOpen={false} key={`${message.id}-${i}`}>
                                <ToolHeader type={part?.type} state={part?.state} />
                                <ToolContent>
                                    {part.state === 'output-available' && <ToolInput input={part.input} />}
                                    <ToolOutput
                                        output={part?.output}
                                        errorText={part?.errorText}
                                    />
                                </ToolContent>
                            </Tool>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
    {/* <Confirmation approval={{ id: nanoid() }} state="approval-requested">
      <ConfirmationTitle>
        <ConfirmationRequest>
          This tool wants to execute a query on the production database:
          <code className="mt-2 block rounded bg-muted p-2 text-sm">
            SELECT * FROM users WHERE role = &apos;admin&apos;
          </code>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
          <span>You approved this tool execution</span>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <XIcon className="size-4 text-destructive" />
          <span>You rejected this tool execution</span>
        </ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction
          onClick={() => {
            // In production, call respondToConfirmationRequest with approved: false
          }}
          variant="outline"
        >
          Reject
        </ConfirmationAction>
        <ConfirmationAction
          onClick={() => {
            // In production, call respondToConfirmationRequest with approved: true
          }}
          variant="default"
        >
          Approve
        </ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>*/}
          {/* <Suggestions className='flex-col'>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={suggestion=> sendMessage({ text: suggestion })}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>  */}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 w-full max-w-2xl mx-auto relative"
          globalDrop multiple
        >
          <PromptInputTextarea
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
            className="pr-12"
          />
          <PromptInputSubmit
            status={status === 'streaming' ? 'streaming' : 'ready'}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInput>
      </div>
    </div>
  );
};