const EMOJI_GROUPS = [
  {
    id: "smileys",
    label: "Smileys",
    emojis: [
      "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
      "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😎", "🤩",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖",
      "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
      "😳", "🥵", "🥶", "😱", "😨", "🤗", "🤔", "🤭", "🤫", "😴",
    ],
  },
  {
    id: "gestures",
    label: "Gestures",
    emojis: [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏", "🙌", "👐",
      "🤝", "🙏", "💪", "🫶", "👋", "🤚", "✋", "🖐️", "👊", "✊",
      "👆", "👇", "👉", "👈", "🫵", "👀", "🙈", "🙉", "🙊", "🫡",
    ],
  },
  {
    id: "hearts",
    label: "Hearts",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "✨",
    ],
  },
  {
    id: "animals",
    label: "Animals",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦄", "🐝",
    ],
  },
  {
    id: "food",
    label: "Food",
    emojis: [
      "🍎", "🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🎂", "🍰",
      "🍫", "☕", "🍵", "🧋", "🍺", "🍷", "🥤", "🍦", "🍓", "🍉",
    ],
  },
  {
    id: "objects",
    label: "More",
    emojis: [
      "🔥", "⭐", "🌟", "💯", "🎉", "🎊", "🎈", "🎁", "🏆", "⚽",
      "🎵", "🎶", "📱", "💻", "⏰", "💡", "📌", "✅", "❌", "⚡",
      "🌙", "☀️", "🌈", "🌸", "🌹", "🍀", "🌍", "✈️", "🚗", "🏠",
    ],
  },
];

const EmojiPicker = ({ onSelect }) => (
  <div
    className="absolute bottom-full left-0 z-30 mb-2 w-[min(100%,20rem)] overflow-hidden rounded-2xl border border-line bg-panel shadow-xl"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="custom-scroll max-h-56 space-y-3 overflow-y-auto p-3 sm:max-h-64">
      {EMOJI_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
            {group.label}
          </p>
          <div className="grid grid-cols-8 gap-0.5">
            {group.emojis.map((emoji) => (
              <button
                key={`${group.id}-${emoji}`}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-surface"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default EmojiPicker;
