import { useEffect, useState } from "react";
import { FiLogOut, FiMessageCircle } from "react-icons/fi";
import { useSocket } from "./context/SocketContext";
import useWebRTC from "./hooks/useWebRTC";

import Login from "./components/Login";
import Register from "./components/Register";
import UserList from "./components/UserList";
import Chat from "./components/Chat";

import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const socket = useSocket();
  const {
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
  } = useWebRTC(socket, user);

  const callUser = (selectedCallUser, callStarter) => {
    setSelectedUser(selectedCallUser);
    callStarter(selectedCallUser._id, selectedCallUser.name);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSelectedUser(null);
  };

  if (!user) {
    if (showRegister) {
      return <Register onRegister={() => setShowRegister(false)} />;
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  const showSidebar = !selectedUser;
  const showChat = Boolean(selectedUser);

  return (
    <div className="h-dvh bg-brand-950 p-0 md:p-3 lg:p-4">
      <div className="mx-auto flex h-full w-full max-w-7xl overflow-hidden bg-panel md:rounded-2xl md:shadow-2xl md:shadow-black/30">
        {/* Sidebar — full width on mobile when no chat selected */}
        <aside
          className={`${
            showSidebar ? "flex" : "hidden"
          } w-full flex-col border-r border-line bg-panel md:flex md:w-[320px] md:min-w-[280px] lg:w-[360px]`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-line bg-brand-800 px-4 py-3.5 text-white sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-sm font-extrabold text-brand-950">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-200">
                  <FiMessageCircle className="h-3.5 w-3.5" />
                  ChatWave
                </div>
                <h2 className="truncate text-sm font-bold sm:text-base">
                  {user.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
              title="Logout"
            >
              <FiLogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </header>

          <UserList
            currentUser={user}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            onAudioCall={(selectedCallUser) =>
              callUser(selectedCallUser, startCall)
            }
            onVideoCall={(selectedCallUser) =>
              callUser(selectedCallUser, startVideoCall)
            }
          />
        </aside>

        {/* Chat — full width on mobile when a chat is selected */}
        <main
          className={`${
            showChat ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col md:flex`}
        >
          <Chat
            currentUser={user}
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
            startCall={startCall}
            startVideoCall={startVideoCall}
            acceptCall={acceptCall}
            rejectCall={rejectCall}
            endCall={endCall}
            incomingCall={incomingCall}
            isCalling={isCalling}
            isInCall={isInCall}
            callType={callType}
            localVideo={localVideo}
            remoteVideo={remoteVideo}
            remoteAudio={remoteAudio}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
