const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

export default function MessageText({ text }) {
  if (!text) {
    return null;
  }

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const [fullMatch] = match;
    const start = match.index;
    const end = start + fullMatch.length;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <span key={`${fullMatch}-${start}`} className="text-primary font-semibold">
        {fullMatch}
      </span>,
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <p>{parts}</p>;
}
