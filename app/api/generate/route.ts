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
        {
          error: "Groq API key not configured. Get one at https://console.groq.com/keys",
        },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a mnemonic generator assistant. Generate a ${type} mnemonic for the following terms in ${style} style.
Return ONLY a valid JSON object with this exact structure: {"mnemonic": "...", "explanation": "..."}
Do not include any other text, markdown, or explanation outside the JSON.`;

    const userPrompt = `Generate a ${type} mnemonic for these terms: ${terms}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", response.status, errorData);
      return NextResponse.json(
        {
          error: "Failed to generate mnemonic. Check your Groq API key.",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let mnemonicData = { mnemonic: "", explanation: "" };

    // Try to parse JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        mnemonicData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse JSON from Groq response");
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

    return NextResponse.json(mnemonicData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
