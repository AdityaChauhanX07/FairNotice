/**
 * Helpers for parsing JSON out of LLM responses, which sometimes wrap their
 * output in Markdown code fences despite instructions not to.
 */

/**
 * Strip Markdown code fences (```json ... ``` or ``` ... ```) that a model may
 * wrap around its JSON, returning the bare JSON string.
 */
export function stripCodeFences(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    // Remove the opening fence (with an optional language tag) and closing fence.
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/, "");
    cleaned = cleaned.replace(/\n?```\s*$/, "");
  }

  return cleaned.trim();
}

/**
 * Strip code fences and parse the result as JSON. Throws a descriptive error
 * if the cleaned text is not valid JSON.
 */
export function parseLLMJson<T>(text: string): T {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error.";
    throw new Error(`Failed to parse the model response as JSON: ${reason}`);
  }
}
