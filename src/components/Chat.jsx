import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import socket from "../Socket";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";

const Chat = ({ selectedUser, user_id }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState({
    online: false,
    lastActive: null
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [failedMessages, setFailedMessages] = useState([]);
  const [activeMessageId, setActiveMessageId] = useState(null);

  const { theme } = useTheme();
  const messagesEndRef = useRef();
  const chatContainerRef = useRef();
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false);

  // Create room ID with proper sorting
  const roomId = useMemo(() => {
    if (!selectedUser?._id || !user_id) return null;
    return [user_id, selectedUser._id].sort().join("_");
  }, [selectedUser?._id, user_id]);

  // ================= SOCKET CONNECTION STATUS =================
  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected");
      setSocketConnected(true);
      if (roomId) {
        socket.emit("join_chat", { roomId });
      }
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setSocketConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // ================= FETCH USER ONLINE STATUS =================
  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchUserStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/user/${selectedUser._id}`,
          { withCredentials: true }
        );
        setUserOnlineStatus({
          online: res.data.online || false,
          lastActive: res.data.lastActive || null
        });
      } catch (error) {
        console.log("Error fetching user status", error);
      }
    };

    fetchUserStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchUserStatus, 30000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  // ================= LOAD CHAT HISTORY =================
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${roomId}`
        );
        setMessages(res.data.messages || []);
        setHasMarkedSeen(false);
      } catch (err) {
        console.log("Error loading messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

  // ================= JOIN CHAT ROOM & CLEAR NOTIFS =================
  useEffect(() => {
    if (!roomId || !socketConnected) return;

    socket.emit("join_chat", { roomId });

    return () => {
      socket.emit("leave_chat", { roomId });
    };
  }, [roomId, socketConnected, selectedUser]);

  // ================= MARK MESSAGES AS SEEN =================
  const markMessagesAsSeen = useCallback(async () => {
    if (!roomId || !user_id || !selectedUser || hasMarkedSeen) return;
    
    const hasUnseenMessages = messages.some(
      (msg) => msg.sender === selectedUser._id && 
      (!msg.seenBy || !msg.seenBy.includes(user_id))
    );

    if (hasUnseenMessages) {
      try {
        await axios.put(
          `http://localhost:5000/api/messages/seen/${roomId}`,
          { userId: user_id },
          { withCredentials: true }
        );

        setMessages(prev => 
          prev.map(msg => {
            if (msg.sender === selectedUser._id && 
                (!msg.seenBy || !msg.seenBy.includes(user_id))) {
              return {
                ...msg,
                seenBy: [...(msg.seenBy || []), user_id]
              };
            }
            return msg;
          })
        );

        if (socketConnected) {
          socket.emit("mark_seen", {
            roomId,
            userId: user_id
          });
        }

        setHasMarkedSeen(true);
      } catch (error) {
        console.log("Error marking messages as seen", error);
      }
    }
  }, [messages, roomId, selectedUser, user_id, hasMarkedSeen, socketConnected]);

  // Check if at bottom on load
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isAtBottom) {
        markMessagesAsSeen();
      }
    }
  }, [messages, markMessagesAsSeen]);

  // ================= SCROLL HANDLER FOR SEEN =================
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const handleScroll = () => {
      const container = chatContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isAtBottom && !hasMarkedSeen) {
        markMessagesAsSeen();
      }
    };

    const container = chatContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMarkedSeen, markMessagesAsSeen]);

  // ================= SOCKET LISTENER =================
  useEffect(() => {
    if (!roomId) return;

    const receiveHandler = (data) => {
      setMessages((prev) => {
        const filtered = prev.filter(
          (msg) => !(msg.status === "sending" && msg.message === data.message)
        );
        return [...filtered, { ...data, status: "sent" }];
      });
      
      setHasMarkedSeen(false);
    };

    const seenHandler = (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.sender === user_id) {
              return {
                ...msg,
                seenBy: [...(msg.seenBy || []), data.userId]
              };
            }
            return msg;
          })
        );
      }
    };

    const userOnlineHandler = (data) => {
      if (data.userId === selectedUser?._id) {
        setUserOnlineStatus({
          online: true,
          lastActive: null
        });
      }
    };

    const userOfflineHandler = (data) => {
      if (data.userId === selectedUser?._id) {
        setUserOnlineStatus({
          online: false,
          lastActive: data.lastActive
        });
      }
    };

    socket.on("receive_message", receiveHandler);
    socket.on("messages_seen", seenHandler);
    socket.on("user_online", userOnlineHandler);
    socket.on("user_offline", userOfflineHandler);

    return () => {
      socket.off("receive_message", receiveHandler);
      socket.off("messages_seen", seenHandler);
      socket.off("user_online", userOnlineHandler);
      socket.off("user_offline", userOfflineHandler);
    };
  }, [roomId, user_id, selectedUser]);

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!message.trim() || !roomId) return;

    const tempId = Date.now().toString();
    const messageText = message.trim();

    const tempMessage = {
      _id: tempId,
      roomId,
      message: messageText,
      sender: user_id,
      receiver: selectedUser._id, // Adding the receiver to trigger backend notification
      seenBy: [],
      status: "sending",
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");

    if (!socketConnected) {
      // Queue message for retry
      setFailedMessages(prev => [...prev, tempMessage]);
      return;
    }

    socket.emit("send_message", tempMessage, (response) => {
      if (response?.error) {
        console.log("Message send failed", response.error);
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, status: "failed" } 
              : msg
          )
        );
      }
    });
    
    setHasMarkedSeen(false);
  };

  // ================= RETRY FAILED MESSAGES =================
  useEffect(() => {
    if (socketConnected && failedMessages.length > 0) {
      failedMessages.forEach(msg => {
        socket.emit("send_message", msg);
      });
      setFailedMessages([]);
    }
  }, [socketConnected, failedMessages]);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/messages/${id}`,
        { withCredentials: true }
      );

      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      console.log("Delete failed", error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.message);
    setActiveMessageId(null);
  };

  const handleUpdate = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/messages/${id}`,
        { message: editText },
        { withCredentials: true }
      );

      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...res.data.message, status: "sent" } : m))
      );

      setEditingId(null);
    } catch (error) {
      console.log("Edit failed", error);
    }
  };

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= CHECK IF MESSAGE IS SEEN =================
  const isMessageSeen = (msg) => {
    return msg.seenBy && msg.seenBy.includes(selectedUser?._id);
  };

  // ================= FORMAT TIME =================
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ================= FORMAT LAST ACTIVE =================
  const formatLastActive = (timestamp) => {
    if (!timestamp) return "Offline";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Active just now";
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    
    return `Last active ${date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 p-4 text-center">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col ${
        theme === "light"
          ? "bg-white text-black"
          : "bg-neutral-900 text-white"
      }`}
    >
      {/* HEADER - with Online/Last Active Status */}
      <div
        className={`p-3 sm:p-4 border-b font-semibold ${
          theme === "light"
            ? "bg-gray-100 border-gray-300"
            : "bg-neutral-800 border-neutral-700"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar with online indicator */}
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {selectedUser.name?.charAt(0).toUpperCase()}
            </div>
            {userOnlineStatus.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{selectedUser.name}</div>
            <div className="text-xs opacity-70">
              {!socketConnected && (
                <span className="text-yellow-500 mr-2">(Connecting...)</span>
              )}
              {userOnlineStatus.online ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </span>
              ) : (
                <span>{formatLastActive(userOnlineStatus.lastActive)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
      >
        {isLoading ? (
          <div className="text-center opacity-60 py-8">
            Loading messages...
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn = msg.sender === user_id;
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1]?.sender !== msg.sender
              );

              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isOwn ? "justify-end" : "justify-start"
                  } items-end gap-2`}
                >
                  {/* Avatar for other users */}
                  {!isOwn && (
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                      showAvatar ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {showAvatar && selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`relative group max-w-[85%] sm:max-w-[70%] ${
                      isOwn ? "mr-1 sm:mr-2" : "ml-1 sm:ml-2"
                    }`}
                    onClick={() => {
                        if (isOwn && !editingId && msg.status !== "failed") {
                            setActiveMessageId(activeMessageId === msg._id ? null : msg._id);
                        }
                    }}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-2xl break-words ${
                        isOwn
                          ? "bg-neutral-800 text-white rounded-br-none"
                          : theme === "light"
                          ? "bg-gray-200 rounded-bl-none"
                          : "bg-neutral-700 rounded-bl-none"
                      }`}
                    >
                      {/* Edit mode */}
                      {editingId === msg._id ? (
                        <div className="space-y-2">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-black px-2 py-1 rounded w-full text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdate(msg._id)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm  sm:text-base inline">{msg.message}</p>
                          
                          {/* Timestamp and status */}
                          <div className="flex items-center justify-end gap-1 mt-1 ">
                            <span className="text-[10px] sm:text-xs opacity-70">
                              {formatTime(msg.createdAt)}
                            </span>
                            
                            {/* Status ticks */}
                            {isOwn && (
                              <span className="text-xs">
                                {msg.status === "sending" && (
                                  <span className="opacity-50" title="Sending...">✓</span>
                                )}
                                {msg.status === "sent" && !isMessageSeen(msg) && (
                                  <span className="opacity-70" title="Sent">✓</span>
                                )}
                                {msg.status === "failed" && (
                                  <span className="text-red-500" title="Failed to send">⚠️</span>
                                )}
                                {isMessageSeen(msg) && (
                                  <span className="text-green-300 font-semibold" title="Seen">✓✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action buttons Desktop (Hover) and Mobile (Click) */}
                    {isOwn && !editingId && msg.status !== "failed" && (
                      <>
                        <div className={`absolute -top-8 right-0 ${activeMessageId === msg._id ? "flex" : "hidden"} sm:hidden! gap-1 bg-gray-800 rounded-lg p-1 shadow-lg z-10`}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(msg); }}
                            className="text-xs bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded transition font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition font-medium"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="absolute -top-8 right-0 hidden sm:group-hover:flex gap-1 bg-gray-800 rounded-lg p-1 shadow-lg">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(msg); }}
                            className="text-xs bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded transition"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}

                    {/* Retry button for failed messages */}
                    {isOwn && msg.status === "failed" && (
                      <button
                        onClick={() => {
                          setMessages(prev => prev.filter(m => m._id !== msg._id));
                          setMessage(msg.message);
                        }}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded mt-1"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* INPUT */}
      <div
        className={`shrink-0 p-3 sm:p-4 border-t pb-[env(safe-area-inset-bottom,12px)] ${
          theme === "light"
            ? "border-gray-300 bg-white"
            : "border-neutral-700 bg-neutral-800"
        }`}
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={socketConnected ? "Type message..." : "Connecting..."}
              rows="1"
              className={`w-full px-3 py-2 rounded-lg focus:outline-none border resize-none ${
                theme === "light"
                  ? "border-gray-300 bg-white"
                  : "border-neutral-600 bg-neutral-700 text-white"
              } ${!socketConnected ? 'opacity-50' : ''}`}
              disabled={!roomId || !socketConnected}
              style={{ maxHeight: '100px' }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!roomId || !message.trim() || !socketConnected}
            className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0 h-[42px]"
          >
            <span className="hidden sm:inline">Send</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>

        {!socketConnected && (
          <p className="text-xs text-yellow-500 mt-1">
            Reconnecting... Messages will be sent when connection is restored.
          </p>
        )}

        {message.length > 200 && (
          <div className="text-xs text-right mt-1 opacity-60">
            {message.length}/1000
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 