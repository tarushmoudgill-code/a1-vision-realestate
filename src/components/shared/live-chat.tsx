"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { from: "bot" | "user"; text: string };

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hi! I'm the A1 Vision Real Estate virtual assistant. How can I help you today? Ask about a property, book an inspection, or request a free appraisal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);

    // Simple keyword-based auto reply + log as a lead
    let reply =
      "Thanks for your message! One of our team will follow up shortly. In the meantime, you can call us on +61 2 9000 0000 or browse our listings.";
    const t = text.toLowerCase();
    if (t.includes("appraisal") || t.includes("value") || t.includes("sell"))
      reply = "Great — we offer free, no-obligation property appraisals. Head to our Appraisal page or share your address and I'll have an agent call you.";
    else if (t.includes("inspect") || t.includes("inspection") || t.includes("view"))
      reply = "You can book an inspection directly from any property listing — just tap 'Book Inspection'. Would you like me to point you to current listings?";
    else if (t.includes("rent") || t.includes("rental"))
      reply = "We manage a growing rental portfolio. Check the 'For Rent' listings or ask about our property management service.";
    else if (t.includes("buy") || t.includes("first home"))
      reply = "Wonderful! Our buyer advocates and first-home specialists can help. Try our mortgage calculator too, and check eligibility for first-home grants.";

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL",
          name: "Live Chat",
          email: "chat@a1vision.com.au",
          phone: "",
          message: text,
        }),
      });
    } catch {
      /* non-fatal */
    }

    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: reply }]);
      setSending(false);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxe transition hover:scale-105 hover:bg-primary/90"
        aria-label="Open live chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-gold ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[440px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-luxe">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-gold-foreground font-serif font-bold">
              A
            </span>
            <div>
              <p className="text-sm font-semibold">A1 Vision Real Estate Assistant</p>
              <p className="text-xs text-primary-foreground/70">
                Typically replies instantly
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4 scrollbar-luxe">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card text-card-foreground rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border bg-card p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message…"
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={send}
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
