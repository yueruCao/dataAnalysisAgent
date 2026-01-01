'use client';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export default function Chatbox() {
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(true);
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
    <div className="max-w-4xl mx-auto relative size-full rounded-lg border">
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-t-lg cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="font-semibold">AI Chat</span>
        {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </div>
      
      {expanded && (<div className="p-4 flex flex-col h-[600px]">
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
      )}
    </div>
  );
};