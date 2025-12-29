# Mnemonica - Complete Workflow & Build Guide

## 📊 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE (Frontend)                  │
│                      app/page.tsx                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. User enters Terms (e.g., "Mitochondria, Lysosomes")   │   │
│  │ 2. Selects Type: "Acronym" or "Acrostic"                 │   │
│  │ 3. Selects Style: "Funny", "Academic", or "Weird"        │   │
│  │ 4. Clicks "Generate ⚡" Button                            │   │
│  │ 5. Loading state shows shimmer animation                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
           HTTP POST Request (JSON payload)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API BACKEND (Server-side)                    │
│                   app/api/generate/route.ts                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Receives POST request with:                           │   │
│  │    - terms: string                                       │   │
│  │    - type: "Acronym" | "Acrostic"                        │   │
│  │    - style: "Funny" | "Academic" | "Weird"              │   │
│  │                                                          │   │
│  │ 2. Validates API key from .env.local                     │   │
│  │                                                          │   │
│  │ 3. Creates system prompt:                                │   │
│  │    "Generate a [type] mnemonic in [style] style"         │   │
│  │                                                          │   │
│  │ 4. Creates user prompt:                                  │   │
│  │    "Generate a [type] mnemonic for: [terms]"             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        HTTP POST Request to Groq API (https://api.groq.com)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   GROQ API (Cloud AI Service)                   │
│                  llama-3.3-70b-versatile Model                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Receives request with:                                │   │
│  │    - model: "llama-3.3-70b-versatile"                    │   │
│  │    - messages: [system prompt, user prompt]              │   │
│  │    - temperature: 0.7 (creative but consistent)          │   │
│  │    - max_tokens: 500 (limit response length)             │   │
│  │                                                          │   │
│  │ 2. Llama 3.3-70B generates mnemonic                       │   │
│  │                                                          │   │
│  │ 3. Returns JSON-formatted response:                       │   │
│  │    {                                                     │   │
│  │      "choices": [{                                       │   │
│  │        "message": {                                      │   │
│  │          "content": "{"mnemonic":"...",                  │   │
│  │                      "explanation":"..."}"               │   │
│  │        }                                                 │   │
│  │      }]                                                  │   │
│  │    }                                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         Parse JSON from Groq response
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API BACKEND (Continued)                      │
│               JSON Parsing & Error Handling                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Extract content from API response                     │   │
│  │ 2. Use regex to find JSON object in string               │   │
│  │ 3. Parse JSON: {"mnemonic": "...", "explanation": "..."} │   │
│  │ 4. Return parsed data to frontend                        │   │
│  │                                                          │   │
│  │ OR handle errors:                                        │   │
│  │ - Invalid API key → 500 error                            │   │
│  │ - API rate limit → 500 error                             │   │
│  │ - JSON parsing fails → fallback response                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
           HTTP Response with JSON data
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Continued)                       │
│                  Display Result & UI Update                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Loading state ends (remove shimmer)                   │   │
│  │ 2. Display result in card:                               │   │
│  │    - Bold mnemonic text                                  │   │
│  │    - Explanation paragraph                               │   │
│  │ 3. Show "Copy to Clipboard" button                        │   │
│  │ 4. User clicks copy → clipboard updated                  │   │
│  │ 5. Button changes to checkmark for 2 seconds             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Breakdown

### 1. Frontend: page.tsx (Client Component)

```typescript
"use client"; // ← Makes this a client component (can use hooks)

import { useState } from "react";
import { Zap, Copy, Check } from "lucide-react";

// Define the shape of API response
interface MnemonicResult {
  mnemonic: string;
  explanation: string;
}

export default function Home() {
  // STATE: What the user enters and selects
  const [terms, setTerms] = useState("");
  const [type, setType] = useState<"Acronym" | "Acrostic">("Acronym");
  const [style, setStyle] = useState<"Funny" | "Academic" | "Weird">("Funny");

  // STATE: API response and UI states
  const [result, setResult] = useState<MnemonicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // FUNCTION: Send data to backend API
  const handleGenerate = async () => {
    // Validate input
    if (!terms.trim()) {
      setError("Please enter some terms");
      return;
    }

    // Show loading state
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // POST request to backend API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terms,
          type,
          style,
        }),
      });

      // Check if response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate mnemonic");
      }

      // Parse and display result
      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Show error message to user
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // Always hide loading state
      setLoading(false);
    }
  };

  // FUNCTION: Copy result to clipboard
  const handleCopy = () => {
    if (result) {
      const textToCopy = `${result.mnemonic}\n\n${result.explanation}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Show checkmark for 2s
    }
  };

  // JSX: Render the UI
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
          <h1 className="text-4xl font-bold text-white">Mnemonica</h1>
          <p className="text-blue-100 mt-2">Generate memorable mnemonics</p>
        </div>

        {/* Input Section */}
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="e.g., Mitochondria, Lysosomes, Ribosomes..."
          className="w-full h-24 px-4 py-3 border-2 border-slate-200 rounded-lg"
        />

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Type Toggle */}
          <div>
            <label>Mnemonic Type</label>
            <div className="flex gap-2">
              {(["Acronym", "Acrostic"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={type === t ? "bg-blue-600" : "bg-slate-100"}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label>Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as typeof style)}
            >
              <option>Funny</option>
              <option>Academic</option>
              <option>Weird</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <Zap size={20} />
          <span>{loading ? "Generating..." : "Generate ⚡"}</span>
        </button>

        {/* Loading State */}
        {loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 animate-pulse">
            {/* Shimmer animation */}
          </div>
        )}

        {/* Result Display */}
        {result && !loading && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold">{result.mnemonic}</h3>
            <p className="text-slate-700">{result.explanation}</p>
            <button onClick={handleCopy}>
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
```

### 2. Backend: app/api/generate/route.ts (Server API)

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse request body
    const { terms, type, style } = await request.json();

    // Step 2: Validate input
    if (!terms || !terms.trim()) {
      return NextResponse.json(
        { error: "Terms are required" },
        { status: 400 }
      );
    }

    // Step 3: Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Step 4: Create system prompt (tells AI what to do)
    const systemPrompt = `You are a mnemonic generator. Generate a ${type} mnemonic in ${style} style.
Return ONLY valid JSON: {"mnemonic": "...", "explanation": "..."}`;

    // Step 5: Create user prompt (what to generate)
    const userPrompt = `Generate a ${type} mnemonic for: ${terms}`;

    // Step 6: Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7, // Creative responses
          max_tokens: 500, // Limit response length
        }),
      }
    );

    // Step 7: Check if API call succeeded
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to generate mnemonic" },
        { status: 500 }
      );
    }

    // Step 8: Extract content from Groq response
    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    // Step 9: Parse JSON from response
    let mnemonicData = { mnemonic: "", explanation: "" };

    // Use regex to find JSON in the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        mnemonicData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON parsing failed");
        mnemonicData = {
          mnemonic: generatedText.substring(0, 200),
          explanation: "Generated mnemonic",
        };
      }
    } else {
      mnemonicData = {
        mnemonic: generatedText.substring(0, 200),
        explanation: "Generated mnemonic",
      };
    }

    // Step 10: Return result to frontend
    return NextResponse.json(mnemonicData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

---

## 🛠️ How to Build This Project from Scratch

### Phase 1: Project Setup

```bash
# 1. Create a new Next.js project with TypeScript & Tailwind
npx create-next-app@latest mnemonica --ts --tailwind --app --eslint

# 2. Navigate to project
cd mnemonica

# 3. Install Lucide React icons
npm install lucide-react
```

### Phase 2: Create API Route

**File: `app/api/generate/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { terms, type, style } = await request.json();

    if (!terms || !terms.trim()) {
      return NextResponse.json(
        { error: "Terms are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a mnemonic generator assistant. Generate a ${type} mnemonic for the following terms in ${style} style.
Return ONLY a valid JSON object with this exact structure: {"mnemonic": "...", "explanation": "..."}
Do not include any other text, markdown, or explanation outside the JSON.`;

    const userPrompt = `Generate a ${type} mnemonic for these terms: ${terms}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to generate mnemonic" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    let mnemonicData = { mnemonic: "", explanation: "" };
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        mnemonicData = JSON.parse(jsonMatch[0]);
      } catch {
        mnemonicData = {
          mnemonic: generatedText.substring(0, 200),
          explanation: "Generated mnemonic",
        };
      }
    }

    return NextResponse.json(mnemonicData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Phase 3: Create Main Page Component

**File: `app/page.tsx`** (The one provided to you)

Replace the entire content with the page.tsx code shown above.

### Phase 4: Configure Environment

**File: `.env.local`**

```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

Get key from: https://console.groq.com/keys

### Phase 5: Configure Tailwind

**File: `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

### Phase 6: Run the Project

```bash
# Development mode
npm run dev

# Visit http://localhost:3000

# Production build
npm run build
npm start
```

---

## 📈 State Management Flow

```
User Types → setTerms(value) → Component Re-renders
                     ↓
User Clicks Toggle → setType(value) → Component Re-renders
                     ↓
User Selects Style → setStyle(value) → Component Re-renders
                     ↓
User Clicks Generate → handleGenerate()
                     ↓
                setLoading(true) → Shimmer shows
                     ↓
        fetch("/api/generate", {...})
                     ↓
        Groq API returns response
                     ↓
         setResult(data) → Result displays
                     ↓
       setLoading(false) → Shimmer hides
```

---

## 🔑 Key Concepts Explained

| Concept                  | Meaning                               | Example                                  |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| **"use client"**         | Run on browser, not server            | React hooks (useState) work here         |
| **async/await**          | Wait for API response                 | `const data = await fetch(...)`          |
| **JSON.stringify**       | Convert object to JSON text           | `{"terms": "Biology"}`                   |
| **JSON.parse**           | Convert JSON text to object           | `{"mnemonic": "..."}`                    |
| **API Route**            | Server endpoint that handles requests | `/api/generate`                          |
| **Environment Variable** | Secret stored in `.env.local`         | `NEXT_PUBLIC_GROQ_API_KEY`               |
| **useState**             | React hook to store component state   | `const [terms, setTerms] = useState("")` |
| **TypeScript Interface** | Define object structure               | `interface MnemonicResult {...}`         |

---

## ✅ Deployment Checklist

To deploy to production:

1. **Add API key to hosting platform** (Vercel, Netlify, etc)

   - Add `NEXT_PUBLIC_GROQ_API_KEY` to environment variables

2. **Build and test**

   ```bash
   npm run build
   npm start
   ```

3. **Deploy**
   ```bash
   # For Vercel
   vercel deploy
   ```

---

## 🎯 How to Customize

Want to change something?

1. **Different AI Model?** Change `model: "llama-3.3-70b-versatile"` in route.ts
2. **Different color scheme?** Update Tailwind classes in page.tsx
3. **More style options?** Add to `setStyle` type and add `<option>` in JSX
4. **More creative?** Increase `temperature: 0.9` (more random), decrease for consistency
5. **Longer responses?** Increase `max_tokens: 1000`

This is a complete, production-ready system! 🚀
