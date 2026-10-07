const EMOJI_RE =
  /^(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Emoji_Modifier})*|\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3)+$/u;

export function isEmoji(value: string | undefined): value is string {
  return typeof value === "string" && EMOJI_RE.test(value.trim());
}
