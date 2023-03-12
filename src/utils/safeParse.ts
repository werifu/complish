export type JsonParseRes = { success: true, data: any } | { success: false, str: string };
export function safeJsonParse(text: string): JsonParseRes {
  try {
    return {
      success: true,
      data: JSON.parse(text),
    }
  } catch (_) {
    return {
      success: false,
      str: text,
    }
  }
}