"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/button";
import {
  AIMessageCard,
  ChatBubble,
  ConversationStarterCard,
  TypingIndicator,
} from "@/components/chat-bubble";
import { CrisisBanner, EscalationCard } from "@/components/crisis-banner";
import { MoodSelector, type MoodKey } from "@/components/mood-selector";
import { converse, getConversation, checkin, type CrisisResource } from "@/lib/api";
import { takePendingMessage } from "@/lib/pending-message";

const TELE_MANAS_TEL = "tel:14416";
const KIRAN_TEL = "tel:18005990019";
const CONVERSATION_STORAGE_KEY = "sahay_chat_conversation_id";

const STARTERS = [
  {
    prompt: "I had a hard conversation with my partner today",
    description: "Talk through what happened and how you're feeling about it",
  },
  {
    prompt: "Someone filed a complaint and I don't know what happens next",
    description: "Get oriented before deciding what to do",
  },
  {
    prompt: "I just need to vent for a minute",
    description: "No structure required — say whatever's on your mind",
  },
];

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

const MOOD_TO_SCORE: Record<MoodKey, number> = {
  low: 1,
  heavy: 2,
  neutral: 3,
  steady: 4,
  good: 5,
};

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [safetyResources, setSafetyResources] = useState<CrisisResource[] | null>(null);
  const [showMoodCheckin, setShowMoodCheckin] = useState(false);
  const [mood, setMood] = useState<MoodKey | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadExisting(id: string) {
      setConversationId(id);
      try {
        const history = await getConversation(id);
        setMessages(history.map((m) => ({ role: m.role, content: m.content })));
      } catch (err) {
        console.error("could not load conversation", err);
      }
    }

    const existingId = window.sessionStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (existingId) {
      void loadExisting(existingId);
    }

    const pending = takePendingMessage();
    if (pending) {
      void send(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    try {
      const result = await converse({
        conversation_id: conversationId,
        message: trimmed,
        agent_type: "emotional-support",
      });
      if (!conversationId) {
        setConversationId(result.conversation_id);
        window.sessionStorage.setItem(CONVERSATION_STORAGE_KEY, result.conversation_id);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
      setSafetyResources(result.safety_interrupt?.resources ?? null);
    } catch (err) {
      console.error("converse failed", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong reaching the companion. You can try again, or use “Get help now” above if you need support right now.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function submitMoodCheckin() {
    if (!mood) return;
    try {
      await checkin({ mood_score: MOOD_TO_SCORE[mood] });
      setShowMoodCheckin(false);
    } catch (err) {
      console.error("checkin failed", err);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
      <CrisisBanner
        dismissible={false}
        onCallHelpline={() => {
          window.location.href = TELE_MANAS_TEL;
        }}
      />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-ink">AI Companion</h1>
        <Button variant="ghost" size="sm" onClick={() => setShowMoodCheckin((v) => !v)}>
          Daily check-in
        </Button>
      </div>

      {showMoodCheckin && (
        <div className="flex flex-col gap-3">
          <MoodSelector value={mood} onChange={setMood} />
          <Button size="sm" className="self-end" disabled={!mood} onClick={submitMoodCheckin}>
            Save check-in
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-muted">Not sure where to start? Try one of these.</p>
            {STARTERS.map((starter) => (
              <ConversationStarterCard
                key={starter.prompt}
                prompt={starter.prompt}
                description={starter.description}
                onClick={() => void send(starter.prompt)}
              />
            ))}
          </div>
        )}

        {messages.map((message, i) =>
          message.role === "user" ? (
            <ChatBubble key={i} role="user">
              {message.content}
            </ChatBubble>
          ) : (
            <AIMessageCard key={i}>{message.content}</AIMessageCard>
          ),
        )}

        {sending && <TypingIndicator />}

        {safetyResources && (
          <EscalationCard
            onCallHelpline={() => {
              window.location.href = TELE_MANAS_TEL;
            }}
            onTalkToHuman={() => {
              window.location.href = KIRAN_TEL;
            }}
            onContinueChat={() => setSafetyResources(null)}
          />
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="sticky bottom-4 flex gap-2 rounded-card-lg border border-border bg-surface p-2 shadow-3"
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 resize-none border-none bg-transparent px-2 py-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending} aria-label="Send message">
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </form>
    </div>
  );
}
