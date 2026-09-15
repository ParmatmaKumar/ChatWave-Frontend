import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiSend,
  FiSmile,
  FiPhoneOff,
  FiCheck,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiCornerUpLeft,
} from "react-icons/fi";

import { useSocket } from "../context/SocketContext";
import api from "../services/api";

const Chat = ({
  currentUser,
  selectedUser,
  onBack,
  startCall,
  startVideoCall,
  acceptCall,
  rejectCall,
  endCall,
  incomingCall,
  isCalling,
  isInCall,
  callType,
  localVideo,
  remoteVideo,
  remoteAudio,
}) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const bottomRef = useRef(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    if (!selectedUser) return;

    const getMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedUser._id}`, {
          headers: authHeaders(),
        });
        setMessages(response.data.messages);
      } catch (error) {
        console.log("Get messages error:", error.response?.data || error.message);
      }
    };

    getMessages();
    setMenuId(null);
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (message.sender?._id === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    const handleMessageUnsent = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, isUnsent: true, text: "" }
            : msg
        )
      );
    };

    socket.on("message-unsent", handleMessageUnsent);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-unsent", handleMessageUnsent);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ senderId }) => {
      if (senderId === selectedUser?._id) setTyping(true);
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (senderId === selectedUser?._id) setTyping(false);
    };

    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.post(
        "/messages/send",
        {
          receiver: selectedUser._id,
          text: text.trim(),
        },
        {
          headers: authHeaders(),
        }
      );

      const message = response.data.message;
      setMessages((prev) => [...prev, message]);

      if (socket) {
        socket.emit("send-message", message);
        socket.emit("stop-typing", {
          senderId: currentUser.id,
          receiverId: selectedUser._id,
        });
      }

      setText("");
      setTyping(false);
    } catch (error) {
      console.log("Send message error:", error.response?.data || error.message);
    }
  };

  const unsendMessage = async (message) => {
    if (!message?._id) return;

    try {
      await api.delete(`/messages/${message._id}/unsend`, {
        headers: authHeaders(),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === message._id
            ? { ...msg, isUnsent: true, text: "" }
            : msg
        )
      );
      setMenuId(null);

      const receiverId = message.receiver?._id || message.receiver;
      socket?.emit("unsend-message", {
        messageId: message._id,
        receiverId,
      });
    } catch (error) {
      console.log("Unsend error:", error.response?.data || error.message);
    }
  };

  const deleteForMe = async (message) => {
    if (!message?._id) return;

    try {
      await api.delete(`/messages/${message._id}/me`, {
        headers: authHeaders(),
      });

      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
      setMenuId(null);
    } catch (error) {
      console.log("Delete error:", error.response?.data || error.message);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (!socket || !selectedUser) return;

    if (value.trim().length > 0) {
      socket.emit("typing", {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
      });
    } else {
      socket.emit("stop-typing", {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
      });
    }
  };

  if (!selectedUser) {
    return (
      <div className="hidden h-full flex-1 flex-col items-center justify-center bg-surface px-6 md:flex">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100 text-brand-700">
            <FiSend className="h-9 w-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Select a chat
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Choose a conversation from the sidebar to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-panel text-ink">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-3 sm:h-[68px] sm:px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink transition hover:bg-surface md:hidden"
            aria-label="Back to chats"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold text-white sm:h-11 sm:w-11">
              {selectedUser.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel bg-emerald-400" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold sm:text-base">
              {selectedUser.name}
            </h2>
            <p className="text-xs font-medium text-brand-600">
              {typing ? "typing..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => startCall(selectedUser._id, currentUser.name)}
            disabled={isCalling || isInCall}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            title="Audio call"
          >
            <FiPhone className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            type="button"
            onClick={() => startVideoCall(selectedUser._id, currentUser.name)}
            disabled={isCalling || isInCall}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            title="Video call"
          >
            <FiVideo className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        className="chat-wallpaper custom-scroll flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:space-y-4 sm:px-5 sm:py-5 md:px-8"
        onClick={() => setMenuId(null)}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl bg-panel/90 px-5 py-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-ink">No messages yet</p>
              <p className="mt-1 text-xs text-muted">
                Say hello to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const senderId = message.sender?._id || message.sender;
            const isMine = String(senderId) === String(currentUser.id);
            const isUnsent = Boolean(message.isUnsent);
            const isMenuOpen = menuId === message._id;

            return (
              <div
                key={message._id || index}
                className={`group flex items-end gap-1 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {isMine && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuId(isMenuOpen ? null : message._id);
                    }}
                    className={`mb-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-panel ${
                      isMenuOpen ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    }`}
                    title="Message options"
                  >
                    <FiMoreVertical className="h-4 w-4" />
                  </button>
                )}

                <div className="relative max-w-[85%] sm:max-w-[75%] md:max-w-[60%]">
                  {isMenuOpen && (
                    <div
                      className={`absolute z-20 w-44 overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-lg ${
                        isMine ? "bottom-full right-0 mb-2" : "bottom-full left-0 mb-2"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isMine && !isUnsent && (
                        <button
                          type="button"
                          onClick={() => unsendMessage(message)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface"
                        >
                          <FiCornerUpLeft className="h-4 w-4" />
                          Unsend
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteForMe(message)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete for me
                      </button>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUnsent
                        ? "border border-dashed border-line bg-panel/80 text-muted"
                        : isMine
                          ? "rounded-br-md bg-brand-600 text-white"
                          : "rounded-bl-md border border-line bg-panel text-ink"
                    }`}
                  >
                    {isUnsent ? (
                      <p className="text-sm italic">This message was deleted</p>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.text}
                      </p>
                    )}
                    <div
                      className={`mt-1 text-right text-[10px] font-medium ${
                        isUnsent
                          ? "text-muted"
                          : isMine
                            ? "text-brand-100"
                            : "text-muted"
                      }`}
                    >
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                </div>

                {!isMine && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuId(isMenuOpen ? null : message._id);
                    }}
                    className={`mb-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-panel ${
                      isMenuOpen ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    }`}
                    title="Message options"
                  >
                    <FiMoreVertical className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line bg-panel px-3 py-3 sm:px-4 sm:py-3.5 md:px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-panel hover:text-brand-700"
            title="Emoji"
          >
            <FiSmile className="h-5 w-5" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={!text.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:h-11 sm:w-11"
            title="Send"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Incoming call */}
      {incomingCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-panel p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-700 animate-pulse">
              {incomingCall.callType === "video" ? (
                <FiVideo className="h-8 w-8" />
              ) : (
                <FiPhone className="h-8 w-8" />
              )}
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">
              {incomingCall.callerName}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Incoming {incomingCall.callType === "video" ? "video" : "audio"}{" "}
              call...
            </p>
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={rejectCall}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <FiX className="h-4 w-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={acceptCall}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                <FiCheck className="h-4 w-4" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing audio */}
      {isCalling && callType === "audio" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-700 animate-pulse">
              <FiPhone className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">Calling...</h2>
            <p className="mt-2 text-sm text-muted">{selectedUser.name}</p>
            <button
              type="button"
              onClick={() => endCall(selectedUser._id)}
              className="mx-auto mt-7 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
              title="End call"
            >
              <FiPhoneOff className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Active audio */}
      {isInCall && callType === "audio" && (
        <div className="fixed bottom-4 right-4 z-[80] rounded-2xl border border-line bg-panel px-4 py-3 shadow-xl sm:bottom-6 sm:right-6 sm:px-5 sm:py-4">
          <audio ref={remoteAudio} autoPlay />
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Audio call</p>
              <p className="mt-0.5 text-xs font-medium text-brand-600">
                Connected
              </p>
            </div>
            <button
              type="button"
              onClick={() => endCall(selectedUser._id)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
              title="End call"
            >
              <FiPhoneOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outgoing video */}
      {isCalling && callType === "video" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black">
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute left-1/2 top-5 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-2xl bg-black/50 px-5 py-3 text-center text-white backdrop-blur-md sm:top-6">
            <p className="font-semibold">Calling...</p>
            <p className="mt-1 text-xs text-white/70">{selectedUser.name}</p>
          </div>
          <button
            type="button"
            onClick={() => endCall(selectedUser._id)}
            className="absolute bottom-8 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition hover:bg-red-700 sm:h-16 sm:w-16"
            title="End call"
          >
            <FiPhoneOff className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Active video */}
      {isInCall && callType === "video" && (
        <div className="fixed inset-0 z-[90] bg-black">
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute right-3 top-3 h-36 w-24 overflow-hidden rounded-2xl border-2 border-white/30 bg-slate-900 shadow-2xl sm:right-5 sm:top-5 sm:h-52 sm:w-40 md:h-64 md:w-52">
            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute left-3 top-3 rounded-xl bg-black/40 px-3 py-2 text-white backdrop-blur-md sm:left-5 sm:top-5 sm:px-4">
            <p className="text-sm font-medium">Video call</p>
            <p className="mt-0.5 text-xs text-white/70">{selectedUser.name}</p>
          </div>
          <button
            type="button"
            onClick={() => endCall(selectedUser._id)}
            className="absolute bottom-8 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition hover:bg-red-700 sm:h-16 sm:w-16"
            title="End call"
          >
            <FiPhoneOff className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
