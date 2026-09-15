import { useEffect, useState } from "react";
import {
  FiCheck,
  FiLogOut,
  FiMessageCircle,
  FiPhone,
  FiVideo,
  FiX,
} from "react-icons/fi";
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

  const acceptIncomingCall = () => {
    if (incomingCall) {
      setSelectedUser({
        _id: incomingCall.from,
        name: incomingCall.callerName,
      });
    }

    acceptCall();
  };

  useEffect(() => {
    if (!incomingCall) return undefined;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return undefined;

    const audioContext = new AudioContext();
    let stopped = false;
    let timeoutId;

    const ring = () => {
      if (stopped) return;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        660,
        audioContext.currentTime + 0.22
      );
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.18,
        audioContext.currentTime + 0.02
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.42
      );
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.45);
      timeoutId = window.setTimeout(ring, 900);
    };

    audioContext.resume().catch(() => {});
    ring();

    return () => {
      stopped = true;
      window.clearTimeout(timeoutId);
      audioContext.close().catch(() => {});
    };
  }, [incomingCall]);

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
            endCall={endCall}
            isCalling={isCalling}
            isInCall={isInCall}
            callType={callType}
            localVideo={localVideo}
            remoteVideo={remoteVideo}
            remoteAudio={remoteAudio}
          />
        </main>
      </div>

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
              Incoming {incomingCall.callType === "video" ? "video" : "audio"} call...
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
                onClick={acceptIncomingCall}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                <FiCheck className="h-4 w-4" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
