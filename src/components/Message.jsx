export default function Message({ message, mine = false }) {
  return (
    <div className={`message-row ${mine ? 'mine' : 'their'}`}>
      <div className={`message-bubble ${mine ? 'mine-bubble' : ''}`}>
        <span className="message-text">{message.text || message.content}</span>
        <span className="message-time">{message.createdAt || 'Now'}</span>
      </div>
    </div>
  )
}
