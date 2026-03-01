import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../hooks/useTheme";
import socket from "../Socket";
import Chat from "../components/Chat";

const ChatPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Back to pulling ID from URL
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Back to setting a selected user
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastMessages, setLastMessages] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // ================= WINDOW RESIZE LISTENER =================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/me", { withCredentials: true }),
          axios.get("http://localhost:5000/api/auth/users", { withCredentials: true }),
        ]);

        setCurrentUser(meRes.data);
        setUsers(usersRes.data);
        
        // Create user details map
        const userMap = {};
        usersRes.data.forEach(user => {
          userMap[user._id] = user;
        });
        setUserDetails(userMap);
        
        // Auto-select user if ID is in URL
        if (id) {
          const userToSelect = usersRes.data.find(u => u._id === id);
          if (userToSelect) {
            setSelectedUser({ ...userToSelect });
          }
        }
        
        await fetchLastMessages(meRes.data._id, usersRes.data);
      } catch (error) {
        console.log("Auth failed");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, id]); // Re-attach dependency to pull from route parameters

  // ================= FETCH LAST MESSAGES =================
  const fetchLastMessages = async (currentUserId, usersList) => {
    try {
      const promises = usersList
        .filter(user => user._id !== currentUserId)
        .map(async (user) => {
          const roomId = [currentUserId, user._id].sort().join("_");
          
          try {
            const res = await axios.get(
              `http://localhost:5000/api/messages/${roomId}?limit=1`,
              { withCredentials: true }
            );
            
            const messages = res.data.messages || [];
            const lastMsg = messages[messages.length - 1];
            
            return {
              userId: user._id,
              lastMessage: lastMsg ? {
                text: lastMsg.message,
                time: lastMsg.createdAt,
                sender: lastMsg.sender,
                seen: lastMsg.seenBy?.includes(currentUserId) || false
              } : null
            };
          } catch {
            return { userId: user._id, lastMessage: null };
          }
        });

      const results = await Promise.all(promises);
      const messageMap = {};
      results.forEach(r => messageMap[r.userId] = r.lastMessage);
      setLastMessages(messageMap);
    } catch (error) {
      console.log("Error fetching last messages", error);
    }
  };

  const user_id = currentUser?._id;

  // ================= FILTER AND SORT USERS =================
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users].filter(user => user._id !== user_id);
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort users
    return filtered.sort((a, b) => {
      // Sort by online status first
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      
      // Then by last message time
      const timeA = lastMessages[a._id]?.time ? new Date(lastMessages[a._id].time).getTime() : 0;
      const timeB = lastMessages[b._id]?.time ? new Date(lastMessages[b._id].time).getTime() : 0;
      return timeB - timeA;
    });
  }, [users, user_id, lastMessages, searchTerm]);

  // ================= FILTER AND SORT USERS =================
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncate = (text, max = 30) => {
    if (!text) return "No messages yet";
    return text.length > max ? text.substring(0, max) : text;
  };

  // Debug logs
  useEffect(() => {
    console.log("Current User ID:", user_id);
    console.log("Users List:", users);
  }, [user_id, users]);

  // ================= LISTEN FOR REALTIME USER ONLINE/OFFLINE =================
  useEffect(() => {
    const onlineHandler = (data) => {
      setUsers(prev => 
        prev.map(u => 
          u._id === data.userId ? { ...u, online: true, lastActive: null } : u
        )
      );
    };

    const offlineHandler = (data) => {
      setUsers(prev => 
        prev.map(u => 
          u._id === data.userId ? { ...u, online: false, lastActive: data.lastActive } : u
        )
      );
    };

    socket.on("user_online", onlineHandler);
    socket.on("user_offline", offlineHandler);

    return () => {
      socket.off("user_online", onlineHandler);
      socket.off("user_offline", offlineHandler);
    };
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin mb-2"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
  
  if (!currentUser) return (
    <div className="h-screen flex items-center justify-center">
      Not authenticated
    </div>
  );

  return (
    <div className={`h-dvh flex flex-col pt-16 ${
      theme === "light" ? "bg-neutral-100 text-black" : "bg-neutral-950 text-white"
    }`}>
      <div className="flex-1 flex overflow-hidden">
        {/* ================= USER LIST ================= */}
        <div className={`
          flex flex-col border-r h-full
          w-full md:w-1/3 lg:w-1/4
          ${selectedUser ? "hidden md:flex" : "flex"} 
          ${theme === "light" ? "bg-white border-gray-300" : "bg-neutral-900 border-neutral-700"}
        `}>
          {/* Header with actions */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="font-bold text-lg">Chats</h2>
          </div>

          {/* Search bar */}
          <div className="p-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${
              theme === "light"
                ? "bg-white border border-gray-300"
                : "bg-neutral-800 border border-neutral-700"
            }`}
          />
        </div>

          <div className="flex-1 overflow-y-auto w-full p-2">
            {filteredAndSortedUsers.length === 0 ? (
              <p className="text-sm opacity-60 text-center py-8">
                {searchTerm ? "No users found" : "No users available"}
              </p>
            ) : (
              filteredAndSortedUsers.map(user => {
                const lastMsg = lastMessages[user._id];
                const isFromMe = lastMsg?.sender === user_id;
                const isSelected = selectedUser?._id === user._id;

                return (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser({ ...user });
                      navigate(`/chat/${user._id}`);
                    }}
                    className={`relative p-3 mb-2 rounded-xl cursor-pointer transition transform hover:scale-[1.02] ${
                      isSelected 
                        ? (theme === "light" ? "bg-gray-200" : "bg-neutral-800")
                        : (theme === "light" ? "hover:bg-gray-100" : "hover:bg-neutral-800")
                    } `}
                  >
                <div className="flex items-start gap-3">
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-green-500`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    {user.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
                    )}
                  </div>

                  {/* User info and message preview */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Name and Time */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className={`font-semibold truncate`}>
                          {user.name}
                        </span>
                        {!user.online && user.lastActive && (
                          <span className="text-[10px] opacity-50 whitespace-nowrap">• {formatTime(user.lastActive)}</span>
                        )}
                      </div>
                      {lastMsg && (
                        <span className={`text-xs shrink-0 ml-2 opacity-60`}>
                          {formatTime(lastMsg.time)}
                        </span>
                      )}
                    </div>
                    
                    {/* Bottom Row: Message Preview and Badge */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm min-w-0">
                        {isFromMe && lastMsg && (
                          <span className="text-xs mr-1 shrink-0">
                            {lastMsg.seen ? (
                              <span className="text-blue-400" title="Seen">✓✓</span>
                            ) : (
                              <span className="opacity-50" title="Sent">✓</span>
                            )}
                          </span>
                        )}
                        <p className={`truncate ${
                          lastMsg ? theme === "light" ? "text-gray-600" : "text-gray-400" : "text-gray-500"
                        }`}>
                          {isFromMe ? `You: ${truncate(lastMsg?.text)}` : truncate(lastMsg?.text || "No messages yet")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= CHAT AREA ================= */}
        {selectedUser ? (
          <div className={`
            flex flex-col h-full
            w-full md:w-2/3 lg:w-3/4
            ${!selectedUser ? "hidden md:flex" : "flex"}
            ${theme === "light" ? "bg-gray-50 bg-opacity-50" : "bg-neutral-900"}
          `}>
             {/* Dynamic Mobile Back Button Header is managed internally to ChatId style previously, we'll recreate the back button header here */}
             <div className={`md:hidden p-3 border-b flex items-center justify-between ${
                theme === "light" ? "border-gray-300 bg-white" : "border-neutral-700 bg-neutral-800"
            }`}>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  navigate("/chat");
                }} 
                className="text-sm font-medium flex items-center gap-1 hover:text-yellow-400 transition"
              >
                ← Back to Inbox
              </button>
            </div>
            
            <div className="flex-1 w-full h-full overflow-hidden">
                <Chat 
                  key={selectedUser._id} 
                  selectedUser={selectedUser} 
                  user_id={user_id} 
                />
            </div>
          </div>
        ) : (
          <div className={`hidden md:flex flex-1 items-center justify-center flex-col gap-4 ${
            theme === "light" ? "bg-gray-50" : "bg-neutral-950"
          }`}>
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white opacity-20">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
             </div>
             <p className="text-xl font-semibold opacity-50">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;