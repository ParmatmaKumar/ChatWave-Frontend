import { useEffect, useMemo, useState } from "react";
import { FiPhone, FiSearch, FiVideo } from "react-icons/fi";
import api from "../services/api";
import { useSocket } from "../context/SocketContext";

const UserList = ({
  currentUser,
  selectedUser,
  setSelectedUser,
  onAudioCall,
  onVideoCall,
}) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [query, setQuery] = useState("");
  const socket = useSocket();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await api.get("/auth/users");
        const otherUsers = response.data.users.filter(
          (user) => user._id !== currentUser.id
        );
        setUsers(otherUsers);
      } catch (error) {
        console.log(error);
      }
    };

    getUsers();
  }, [currentUser.id]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("user-online", currentUser.id);

    socket.on("online-users", (list) => {
      setOnlineUsers(list);
    });

    return () => {
      socket.off("online-users");
    };
  }, [socket, currentUser.id]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => user.name?.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <div className="border-b border-line px-3 py-3 sm:px-4">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-xl border border-line bg-panel py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          Chats
        </h2>
      </div>

      <div className="custom-scroll flex-1 space-y-1 overflow-y-auto px-2 pb-4 sm:px-3">
        {filteredUsers.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">
            {query ? "No users match your search" : "No other users yet"}
          </p>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isActive = selectedUser?._id === user._id;

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-900/15"
                    : "hover:bg-brand-50"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold ${
                      isActive
                        ? "bg-white text-brand-800"
                        : "bg-gradient-to-br from-brand-700 to-brand-500 text-white"
                    }`}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${
                      isActive ? "border-brand-600" : "border-surface"
                    } ${isOnline ? "bg-emerald-400" : "bg-slate-400"}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`truncate text-sm font-bold ${
                      isActive ? "text-white" : "text-ink"
                    }`}
                  >
                    {user.name}
                  </h3>
                  <p
                    className={`text-xs font-medium ${
                      isActive ? "text-brand-50/90" : "text-muted"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAudioCall(user);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onAudioCall(user);
                      }
                    }}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "text-white hover:bg-white/15"
                        : "text-brand-700 hover:bg-brand-100"
                    }`}
                    title={`Audio call ${user.name}`}
                  >
                    <FiPhone className="h-4 w-4" />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onVideoCall(user);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onVideoCall(user);
                      }
                    }}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "text-white hover:bg-white/15"
                        : "text-sky-700 hover:bg-sky-50"
                    }`}
                    title={`Video call ${user.name}`}
                  >
                    <FiVideo className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;
