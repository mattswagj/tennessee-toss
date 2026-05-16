import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchMenuContext(): Promise<string> {
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data } = await sb
      .from("menu_items")
      .select("name_en, description_en, price, calories, category, is_available, dietary_tags")
      .eq("is_available", true)
      .order("display_order");

    if (!data || data.length === 0) return STATIC_MENU_FALLBACK;

    const lines = data.map((item) => {
      const tags = Array.isArray(item.dietary_tags) && item.dietary_tags.length > 0
        ? ` [${item.dietary_tags.join(", ")}]`
        : "";
      const cal = item.calories ? ` | ${item.calories} cal` : "";
      const desc = item.description_en ? ` — ${item.description_en}` : "";
      return `• ${item.name_en} $${Number(item.price).toFixed(2)}${cal}${tags}${desc}`;
    });

    return `LIVE MENU (today's available items):\n${lines.join("\n")}`;
  } catch {
    return STATIC_MENU_FALLBACK;
  }
}

const STATIC_MENU_FALLBACK = `
SIGNATURE SALADS:
• The Tennessee Classic $12.99 — Romaine, grilled chicken, cheddar, cornbread croutons, BBQ ranch
• The Nashville Hot $13.99 — Kale, crispy chicken, pepper jack, pickles, Nashville hot honey glaze
• Smoky Mountain Bowl $14.99 — Mixed greens, pulled pork, smoked gouda, roasted corn, chipotle vinaigrette
• The Garden State $10.99 [Vegan, Gluten-Free] — Spinach, cucumber, tomatoes, avocado, feta, lemon vinaigrette
• Southern Caesar $11.99 — Romaine, parmesan, cornbread croutons, boiled egg, Caesar dressing
• Appalachian Harvest $12.99 — Kale, roasted sweet potato, cranberries, pecans, goat cheese, honey mustard
• The Volunteer $13.49 — Mixed greens, grilled shrimp, mango, red cabbage, edamame, sesame ginger
• Protein Power $13.99 [Keto-friendly] — Spinach, grilled chicken, egg, chickpeas, quinoa, balsamic

BUILD YOUR OWN: Start at $8 for any base (Romaine, Spinach, Mixed Greens, Kale), add free toppings, then optionally add protein (+$2.49–$4.99) and dressing (+$0.50–$0.99).

DRINKS: Water $1 | Sweet Tea $1.99 | Lemonade $2.99 | Sparkling Water $1.50
`.trim();

function buildSystemPrompt(language: string, menuContext: string): string {
  const loyaltyInfo = `
LOYALTY PROGRAM:
- Earn 10 points per $1 spent
- 500 pts = Free Dressing or Side
- 1,000 pts = $5 Off Your Order
- 2,000 pts = Free Salad
- Sign up at /account to get your member card with QR code
`.trim();

  const brandVoice = language === "es"
    ? `Eres el Asistente de Tennessee Toss — amigable, cálido y orgulloso de los sabores del sur de Tennessee. Responde SIEMPRE en español. Sé breve (máx. 120 palabras salvo que pidan detalles). Si alguien quiere recomendaciones, haz 1-2 preguntas sobre sus preferencias primero.`
    : `You are the Toss Assistant for Tennessee Toss — friendly, warm, and proud of Tennessee roots. You speak with a bit of Southern charm ("y'all", "mighty fine", "bless your heart" used sparingly). Be concise (under 120 words unless a menu breakdown is needed). If someone asks for a recommendation, ask 1-2 quick questions about their preferences first (e.g. "light or hearty?", "any protein preference?"). Never make up items not on the menu.`;

  return `${brandVoice}

${menuContext}

${loyaltyInfo}

DIETARY shortcuts: [V] = Vegan | [K] = Keto-friendly | [GF] = Gluten-Free`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const menuContext = await fetchMenuContext();
    const systemPrompt = buildSystemPrompt(language ?? "en", menuContext);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "messages-2023-12-15",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        stream: true,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!anthropicRes.ok || !anthropicRes.body) {
      const err = await anthropicRes.text();
      console.error("Anthropic error:", err);
      return new Response(JSON.stringify({ error: "Upstream error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Proxy the SSE stream, extracting text deltas
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(parsed.delta.text));
              }
            } catch {
              // ignore parse errors on partial lines
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
