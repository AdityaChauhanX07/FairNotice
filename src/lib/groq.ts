import Groq from "groq-sdk";

let _groq: Groq | null = null;

function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/** Default model used across the extraction pipeline. */
export const GROQ_MODEL = "llama-3.3-70b-versatile";

interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * Thin wrapper around the Groq chat completion API.
 *
 * Returns the assistant message content as a string. Defaults to a low
 * temperature for deterministic, precise outputs.
 */
export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const { temperature = 0.1, max_tokens = 4096 } = options;

  try {
    const completion = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      temperature,
      max_tokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return content;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error.";
    throw new Error(`Groq chat completion failed: ${message}`);
  }
}
