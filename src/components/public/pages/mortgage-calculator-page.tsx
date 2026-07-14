"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Calculator,
  DollarSign,
  Percent,
  CalendarClock,
  TrendingUp,
  Receipt,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionHeading } from "@/components/shared/section-heading";
import { useRouter } from "@/store/router";
import { formatPrice } from "@/lib/format";

const LOAN_TERMS = [
  { value: "15", label: "15 years" },
  { value: "20", label: "20 years" },
  { value: "25", label: "25 years" },
  { value: "30", label: "30 years" },
];

/**
 * Victorian stamp duty estimate (general rate, no concessions).
 * Source: Victorian State Revenue slab-based formula. Labelled estimate only.
 */
function nswStampDuty(value: number): number {
  const V = Math.max(0, Math.round(value));
  if (V <= 16000) return V * 0.0125;
  if (V <= 35000) return 200 + (V - 16000) * 0.015;
  if (V <= 93000) return 485 + (V - 35000) * 0.0175;
  if (V <= 351000) return 1500 + (V - 93000) * 0.035;
  if (V <= 1150000) return 8530 + (V - 351000) * 0.045;
  if (V <= 3650000) return 44705 + (V - 1150000) * 0.055;
  return 182305 + (V - 3650000) * 0.07;
}

function monthlyRepayment(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

export function MortgageCalculatorPage() {
  const navigate = useRouter((s) => s.navigate);

  const [price, setPrice] = useState(1_500_000);
  const [depositPct, setDepositPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const calc = useMemo(() => {
    const deposit = (price * depositPct) / 100;
    const loan = Math.max(0, price - deposit);
    const monthly = monthlyRepayment(loan, interestRate, termYears);
    const totalPayments = monthly * termYears * 12;
    const totalInterest = Math.max(0, totalPayments - loan);
    const stampDuty = nswStampDuty(price);
    const upfront = deposit + stampDuty;
    const principalPct = totalPayments > 0 ? (loan / totalPayments) * 100 : 0;
    const interestPct = totalPayments > 0 ? (totalInterest / totalPayments) * 100 : 0;
    return {
      deposit,
      loan,
      monthly,
      totalPayments,
      totalInterest,
      stampDuty,
      upfront,
      principalPct,
      interestPct,
    };
  }, [price, depositPct, interestRate, termYears]);

  const chartData = [
    { name: "Principal", value: Math.round(calc.loan), color: "var(--primary)" },
    { name: "Interest", value: Math.round(calc.totalInterest), color: "var(--gold)" },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        </div>
        <div className="container-tight relative py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-6 bg-gold" /> Tools & Resources
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Mortgage Calculator
            </h1>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/80">
              Estimate your monthly repayments, total interest and upfront
              costs in seconds. Adjust the sliders to model different
              scenarios.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="container-tight py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Inputs */}
          <Card className="p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold">
              Loan details
            </h2>
            <Separator className="my-4" />

            {/* Property price */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="price" className="text-sm font-medium">
                  Property price
                </Label>
                <span className="font-serif text-lg font-semibold text-primary">
                  {formatPrice(price)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    max={20_000_000}
                    step={50000}
                    value={price}
                    onChange={(e) =>
                      setPrice(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <Slider
                value={[price]}
                min={100000}
                max={10_000_000}
                step={50000}
                onValueChange={(v) => setPrice(v[0])}
                aria-label="Property price"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$100K</span>
                <span>$10M</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Deposit */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="deposit" className="text-sm font-medium">
                  Deposit ({depositPct}%)
                </Label>
                <span className="font-serif text-lg font-semibold text-primary">
                  {formatPrice(calc.deposit)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="deposit"
                    type="number"
                    min={0}
                    max={price}
                    step={5000}
                    value={Math.round(calc.deposit)}
                    onChange={(e) => {
                      const d = Math.max(0, Number(e.target.value) || 0);
                      const pct = price > 0 ? (d / price) * 100 : 0;
                      setDepositPct(Math.min(100, Math.max(0, Math.round(pct))));
                    }}
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <Slider
                value={[depositPct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => setDepositPct(v[0])}
                aria-label="Deposit percentage"
              />
              <div className="flex flex-wrap gap-1.5">
                {[10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDepositPct(pct)}
                    className={`min-h-9 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      depositPct === pct
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Interest rate */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="rate" className="text-sm font-medium">
                  Interest rate (p.a.)
                </Label>
                <span className="font-serif text-lg font-semibold text-primary">
                  {interestRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Percent
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="rate"
                    type="number"
                    min={0}
                    max={20}
                    step={0.05}
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(
                        Math.max(0, Math.min(20, Number(e.target.value) || 0))
                      )
                    }
                    className="h-11 pl-9"
                  />
                </div>
              </div>
              <Slider
                value={[interestRate]}
                min={0}
                max={15}
                step={0.05}
                onValueChange={(v) => setInterestRate(v[0])}
                aria-label="Interest rate"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>15%</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Loan term */}
            <div className="space-y-3">
              <Label htmlFor="term" className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarClock size={15} className="text-gold" /> Loan term
              </Label>
              <Select
                value={String(termYears)}
                onValueChange={(v) => setTermYears(Number(v))}
              >
                <SelectTrigger id="term" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TERMS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Results */}
          <div className="flex flex-col gap-6">
            {/* Headline monthly repayment */}
            <Card className="overflow-hidden p-0">
              <div className="bg-primary p-6 text-primary-foreground sm:p-8">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <Calculator size={14} /> Estimated monthly repayment
                </p>
                <p className="mt-2 font-serif text-5xl font-semibold sm:text-6xl">
                  {formatPrice(Math.round(calc.monthly))}
                </p>
                <p className="mt-2 text-sm text-primary-foreground/75">
                  Over {termYears} years at {interestRate.toFixed(2)}% p.a.
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Loan amount
                  </p>
                  <p className="mt-1 font-serif text-xl font-semibold">
                    {formatPrice(Math.round(calc.loan))}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total repayable
                  </p>
                  <p className="mt-1 font-serif text-xl font-semibold">
                    {formatPrice(Math.round(calc.totalPayments))}
                  </p>
                </div>
              </div>
            </Card>

            {/* Chart + breakdown */}
            <Card className="p-6 sm:p-8">
              <h3 className="font-serif text-lg font-semibold">
                Principal vs interest
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Of your total repayments over the life of the loan.
              </p>

              <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative h-52 w-52 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatPrice(Math.round(value))}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          color: "var(--foreground)",
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-serif text-base font-semibold">
                      {formatPrice(Math.round(calc.totalPayments))}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <LegendRow
                    color="var(--primary)"
                    label="Principal"
                    value={formatPrice(Math.round(calc.loan))}
                    pct={calc.principalPct}
                  />
                  <LegendRow
                    color="var(--gold)"
                    label="Interest"
                    value={formatPrice(Math.round(calc.totalInterest))}
                    pct={calc.interestPct}
                  />
                </div>
              </div>
            </Card>

            {/* Upfront costs */}
            <Card className="p-6 sm:p-8">
              <h3 className="font-serif text-lg font-semibold">
                Upfront costs
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                What you'll need to pay on day one (estimate only).
              </p>
              <Separator className="my-4" />
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Receipt size={15} className="text-gold" /> Victorian stamp duty
                  </dt>
                  <dd className="font-semibold">
                    {formatPrice(Math.round(calc.stampDuty))}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign size={15} className="text-gold" /> Deposit
                  </dt>
                  <dd className="font-semibold">
                    {formatPrice(Math.round(calc.deposit))}
                  </dd>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base">
                  <dt className="font-medium text-foreground">Total upfront</dt>
                  <dd className="font-serif text-xl font-semibold text-primary">
                    {formatPrice(Math.round(calc.upfront))}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info size={13} className="mt-0.5 shrink-0" />
                Stamp duty uses standard Victorian rates and excludes concessions,
                grants and exemptions. This is an estimate only — speak to a
                conveyancer for an exact figure.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="mt-10 flex flex-col items-start justify-between gap-4 bg-cream/60 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-gold text-gold-foreground">
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold">
                Ready to take the next step?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get pre-approved with our trusted broker network and put these
                numbers into action.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("contact")}
            className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get pre-approved
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Card>
      </section>
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
  pct,
}: {
  color: string;
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-foreground">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, pct))}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">
        {pct.toFixed(1)}% of total
      </p>
    </div>
  );
}
