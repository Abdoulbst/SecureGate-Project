# SKILL: Flutterwave Integration

> Use this skill whenever implementing any Flutterwave payment feature: inline payment, webhook handling, payment verification, or Pay Now links.

---

## Overview

SwiftBill uses Flutterwave as its payment gateway. The integration has two parts:

1. **Client-side:** Flutterwave Inline JS — renders the payment modal on `/pay/[invoiceId]`
2. **Server-side:** Webhook handler + server-to-server verification at `/api/webhooks/flutterwave`

---

## Package Installation

```bash
npm install flutterwave-node-v3
# Types (if needed)
npm install --save-dev @types/flutterwave-node-v3
```

The Flutterwave Inline JS is loaded via CDN script tag — no npm package needed for the client modal.

---

## Environment Variables Required

```bash
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxx-X      # Safe for client
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxx-X      # Server only
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_here        # Server only — set in FLW dashboard
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxx-X          # Public alias for client-side use
```

---

## Step 1: Create a Payment Record (Server)

Before rendering the payment page, create a `Payment` record in `PENDING` state. This prevents duplicate processing and enables idempotency.

```ts
// src/actions/payment.actions.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function initiatePayment(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Scope to freelancer via session
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, freelancerId: session.user.id },
    include: { client: true },
  });
  if (!invoice || invoice.status === "PAID") throw new Error("Invalid invoice");

  // SWB- prefix required per AGENTS.md slug rules
  const txRef = `SWB-${randomUUID()}`;

  const payment = await prisma.payment.upsert({
    where: { invoiceId },
    update: {},  // Do not overwrite if already exists
    create: {
      invoiceId,
      flutterwaveRef: txRef,
      // Balance formula per AGENTS.md: totalKobo + vatKobo - whtKobo - depositKobo
      amountKobo: invoice.totalKobo + invoice.vatKobo - invoice.whtKobo - invoice.depositKobo,
      status: "PENDING",
    },
  });

  return { txRef: payment.flutterwaveRef, amountNaira: Number(payment.amountKobo) / 100 };
}
```

---

## Step 2: Client-Side Payment Modal

```tsx
// src/app/pay/[invoiceId]/PayButton.tsx
"use client";

declare global {
  interface Window { FlutterwaveCheckout: (config: FlutterwaveConfig) => void; }
}

type FlutterwaveConfig = {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: { email: string; name: string };
  customizations: { title: string; description: string };
  callback: (response: { status: string; transaction_id: string }) => void;
  onclose: () => void;
};

type Props = {
  txRef: string;
  amountNaira: number;
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
};

export function PayButton({ txRef, amountNaira, clientEmail, clientName, invoiceNumber }: Props) {
  const handlePay = () => {
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
      tx_ref: txRef,
      amount: amountNaira,
      currency: "NGN",
      customer: { email: clientEmail, name: clientName },
      customizations: {
        title: "SwiftBill Payment",
        description: `Payment for invoice ${invoiceNumber}`,
      },
      callback: (response) => {
        if (response.status === "successful") {
          // Redirect to confirmation page — webhook will handle DB update
          window.location.href = `/pay/success?ref=${txRef}`;
        }
      },
      onclose: () => console.log("Payment modal closed"),
    });
  };

  return <button onClick={handlePay}>Pay Now</button>;
}
```

Load the Flutterwave script in the pay page layout:
```tsx
// src/app/pay/[invoiceId]/layout.tsx
import Script from "next/script";
export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
```

---

## Step 3: Webhook Handler

See `skills/flutterwave-integration/resources/webhook-handler.ts` for the complete, production-ready implementation.

**Key rules:**
1. Verify HMAC-SHA256 signature **before** any DB operation.
2. Check idempotency — if `Payment.status` is already `SUCCESS`, return `200` immediately.
3. Verify payment server-to-server via Flutterwave's verify endpoint.
4. Only then: update `Payment → SUCCESS` and `Invoice → PAID` in a single Prisma transaction.

---

## Step 4: Server-to-Server Verification

Always verify after receiving the webhook — never trust the payload alone:

```ts
// src/lib/flutterwave/verify.ts
export async function verifyFlutterwaveTransaction(transactionId: string): Promise<boolean> {
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data.status === "success" && data.data.status === "successful";
}
```

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Trusting webhook payload without signature check | Always verify HMAC-SHA256 first |
| Trusting webhook payload without server-to-server verify | Always call `/v3/transactions/:id/verify` |
| Using `FLUTTERWAVE_SECRET_KEY` in client code | Server-side only — never `NEXT_PUBLIC_` |
| Not creating `Payment` record before modal opens | Always create `PENDING` payment before client pays |
| Processing webhook twice (replay) | Check `Payment.status === PENDING` before processing |
| Using Naira floats for the `amount` field | Divide `amountKobo / 100` — Flutterwave takes Naira |
| Not handling `onclose` | User may close modal without paying — do not mark as paid |

---

## Flutterwave Dashboard Setup

1. Log in at [dashboard.flutterwave.com](https://dashboard.flutterwave.com)
2. Go to **Settings → Webhooks**
3. Set webhook URL to: `https://your-domain.com/api/webhooks/flutterwave`
4. Copy the **Secret Hash** → set as `FLUTTERWAVE_WEBHOOK_SECRET` in Vercel env vars
5. Enable events: `charge.completed`
6. Use **Test keys** during development, **Live keys** for production