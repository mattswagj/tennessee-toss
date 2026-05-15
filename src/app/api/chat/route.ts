import { NextRequest, NextResponse } from "next/server";

const MENU_CONTEXT = `
Tennessee Toss is a fresh salad restaurant with a bold Tennessee-inspired personality.

SIGNATURE SALADS:
- The Tennessee Classic – $12.99 | Romaine, grilled chicken, cheddar, cornbread croutons, BBQ ranch dressing
- The Nashville Hot – $13.99 | Chopped kale, crispy chicken, pepper jack, pickles, Nashville hot honey glaze
- Smoky Mountain Bowl – $14.99 | Mixed greens, pulled pork, smoked gouda, roasted corn, smoked chipotle vinaigrette
- The Garden State – $10.99 | Spinach, cucumber, tomatoes, avocado, red onion, feta, lemon vinaigrette
- Southern Caesar – $11.99 | Romaine hearts, parmesan, cornbread croutons, boiled egg, Caesar dressing
- Appalachian Harvest – $12.99 | Kale, roasted sweet potato, dried cranberries, pecans, goat cheese, honey mustard
- The Volunteer – $13.49 | Mixed greens, grilled shrimp, mango, red cabbage, edamame, sesame ginger dressing
- Protein Power – $13.99 | Spinach, grilled chicken, boiled egg, chickpeas, quinoa, balsamic vinaigrette

PROTEIN ADD-ONS:
- Grilled Chicken +$3.99 | Grilled Steak +$4.99 | Grilled Shrimp +$4.49 | Tofu +$2.49 | Boiled Egg +$1.99

DRESSINGS (add-on):
- Ranch +$0.99 | Balsamic Vinaigrette +$0.75 | Honey Mustard +$0.75 | Caesar +$0.99 | Lemon Vinaigrette +$0.50

DRINKS:
- Water $1.00 | Lemonade $2.99 | Sweet Tea $1.99 | Sparkling Water $1.50

BUILD YOUR OWN SALAD:
Choose a base (Romaine $8, Spinach $8, Mixed Greens $8, Kale $8), then add free toppings (tomatoes, cucumbers, red onion, corn, croutons, avocado, bacon bits), then optionally add a protein and dressing at listed prices.

LOYALTY PROGRAM:
- Earn 1 point per $1 spent
- Every 500 points = $5 reward
- Points can be redeemed at checkout

DIETARY:
- Vegan options: Garden State (no feta), Appalachian Harvest (no cheese), any Build-Your-Own with Tofu
- Keto-friendly: any salad without croutons or sweet potato, high-protein options
- Gluten-free: most salads without cornbread croutons

BRAND PERSONALITY: Friendly, energetic, proud of Tennessee roots, welcoming to everyone.
`;

function getSystemPrompt(language: string): string {
  if (language === "es") {
    return `Eres el Asistente de Tennessee Toss, un chatbot amigable y lleno de energía para un restaurante de ensaladas frescas con sabores de Tennessee. Responde SIEMPRE en español. Ayuda a los clientes a encontrar la ensalada perfecta según sus metas dietéticas, y comparte información sobre el menú, precios y el programa de lealtad con entusiasmo.

${MENU_CONTEXT}

INSTRUCCIONES: Responde siempre en español. Sé amigable, breve y útil. Si alguien pide recomendaciones, haz 1-2 preguntas sobre sus preferencias antes de sugerir algo específico.`;
  }
  return `You are the Tennessee Toss Assistant, a friendly and energetic chatbot for a fresh salad restaurant with bold Tennessee flavors. Help customers find their perfect salad based on their dietary goals, and share menu info, prices, and loyalty program details with enthusiasm.

${MENU_CONTEXT}

INSTRUCTIONS: Be friendly, concise, and helpful. If someone asks for recommendations, ask 1-2 questions about their preferences before suggesting something specific. Keep responses under 150 words unless a detailed breakdown is needed.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: getSystemPrompt(language ?? "en"),
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.content[0].text });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
