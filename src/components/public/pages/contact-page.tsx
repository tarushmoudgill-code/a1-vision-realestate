"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Loader2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Building2,
  Award,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { BUSINESS, SOCIAL } from "@/lib/constants";

const SUBJECTS = [
  "General Enquiry",
  "Book Inspection",
  "Property Appraisal",
  "List My Property",
  "Career",
  "Media",
];

const SOCIAL_LINKS = [
  { key: "facebook", href: SOCIAL.facebook, Icon: Facebook, label: "Facebook" },
  { key: "instagram", href: SOCIAL.instagram, Icon: Instagram, label: "Instagram" },
  { key: "linkedin", href: SOCIAL.linkedin, Icon: Linkedin, label: "LinkedIn" },
  { key: "youtube", href: SOCIAL.youtube, Icon: Youtube, label: "YouTube" },
];

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: "APPRAISAL" | "LIST_PROPERTY";
  title: string;
  description: string;
}

function LeadDialog({ open, onOpenChange, type, title, description }: LeadDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email and a short message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, email, phone, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Thanks! Our team will be in touch within one business day.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`ld-${type}-name`}>Full name *</Label>
            <Input id={`ld-${type}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`ld-${type}-email`}>Email *</Label>
              <Input id={`ld-${type}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`ld-${type}-phone`}>Phone</Label>
              <Input id={`ld-${type}-phone`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`ld-${type}-msg`}>Message *</Label>
            <Textarea id={`ld-${type}-msg`} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us a little about your situation…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={16} className="animate-spin" />} Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContactPage() {
  const navigate = useRouter((s) => s.navigate);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<string>("General Enquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appraisalOpen, setAppraisalOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Name, email and message are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Message sent! We'll be in touch within one business day.");
      setName(""); setEmail(""); setPhone(""); setSubject("General Enquiry"); setMessage("");
    } catch {
      toast.error("Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt="Modern office interior"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-tight relative z-10 py-16 text-center sm:py-24">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Contact
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            Questions, inspections, appraisals — whatever you need, our team is ready
            to help. Reach out and we&apos;ll respond within one business day.
          </p>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="container-tight pt-12">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="group cursor-pointer border-gold/30 bg-cream p-6 transition hover:shadow-luxe"
            onClick={() => setAppraisalOpen(true)}
          >
            <CardContent className="flex items-center gap-4 p-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
                <Award size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold">Book a free appraisal</h3>
                <p className="text-sm text-muted-foreground">Find out what your home is worth.</p>
              </div>
              <ArrowRight size={18} className="text-gold transition group-hover:translate-x-1" />
            </CardContent>
          </Card>
          <Card
            className="group cursor-pointer p-6 transition hover:shadow-luxe"
            onClick={() => setListOpen(true)}
          >
            <CardContent className="flex items-center gap-4 p-0">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Home size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold">List your property</h3>
                <p className="text-sm text-muted-foreground">Start the conversation about selling.</p>
              </div>
              <ArrowRight size={18} className="text-primary transition group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="container-tight py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* FORM */}
          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <SectionHeading
                eyebrow="Send a Message"
                title="We'd love to hear from you"
                description="Fill in the form below and we'll get back to you within one business day."
              />
              <form onSubmit={submit} className="mt-8 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="c-name">Full name *</Label>
                    <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-email">Email *</Label>
                    <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="c-phone">Phone</Label>
                    <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-subject">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="c-subject" className="w-full">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-message">Message *</Label>
                  <Textarea
                    id="c-message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:justify-start bg-gold text-gold-foreground hover:bg-gold/90">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* INFO */}
          <div className="space-y-6">
            <Card className="bg-cream shadow-sm">
              <CardContent className="space-y-5 p-6">
                <h3 className="font-serif text-xl font-semibold">Contact details</h3>
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 group">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">{BUSINESS.phone}</span>
                  </span>
                </a>
                <a href={`mailto:${BUSINESS.email}`} className="flex items-start gap-3 group">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Mail size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{BUSINESS.email}</span>
                  </span>
                </a>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Address</span>
                    <span className="font-medium text-foreground">{BUSINESS.address}</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                    <Clock size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Office hours</span>
                    <span className="font-medium text-foreground">{BUSINESS.hours}</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="font-serif text-lg font-semibold">Follow us</h3>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ key, href, Icon, label }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-11 w-11 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-gold hover:bg-gold hover:text-gold-foreground"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* OFFICES */}
      <section className="bg-cream">
        <div className="container-tight py-16 sm:py-24">
          <SectionHeading
            eyebrow="Our Offices"
            title="Visit us in person"
            description="Three convenient locations across Melbourne — pop in for a coffee and a chat about your property goals."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BUSINESS.offices.map((office) => (
              <Card key={office.name} className="bg-background">
                <CardContent className="space-y-4 p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
                    <Building2 size={22} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{office.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                      {office.address}
                    </p>
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 font-medium text-foreground hover:text-primary">
                      <Phone size={15} className="text-primary" />
                      {office.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="container-tight py-16 sm:py-24">
        <SectionHeading
          eyebrow="Find Us"
          title="Hoppers Crossing head office"
          description="Conveniently located on Elm Park Drive in Hoppers Crossing, with easy access from the Princes Freeway and plenty of on-site parking."
          align="center"
        />
        <Card className="mt-10 overflow-hidden p-0">
          <div className="relative aspect-[16/9] w-full">
            <iframe
              title="A1 Vision Real Estate Hoppers Crossing office map"
              src="https://www.google.com/maps?q=2+Elm+Park+Drive+Hoppers+Crossing+VIC+3029&output=embed"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container-tight pb-16 sm:pb-24">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 p-0 text-white shadow-luxe">
          <CardContent className="grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                Ready to take the next step?
              </h2>
              <p className="mt-2 max-w-xl text-white/80">
                Book a free appraisal or list your property with our team — no
                obligation, just expert advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setAppraisalOpen(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Award size={16} /> Book free appraisal
              </Button>
              <Button variant="outline" onClick={() => navigate("services")} className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Explore services <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <LeadDialog
        open={appraisalOpen}
        onOpenChange={setAppraisalOpen}
        type="APPRAISAL"
        title="Book a Free Appraisal"
        description="Tell us a little about your property and we'll prepare a complimentary, no-obligation market appraisal."
      />
      <LeadDialog
        open={listOpen}
        onOpenChange={setListOpen}
        type="LIST_PROPERTY"
        title="List Your Property"
        description="Thinking of selling? Share a few details and our team will be in touch to discuss a tailored campaign."
      />
    </div>
  );
}
