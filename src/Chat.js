import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("https://chat-backend-uj3u.onrender.com");

const Chat = () => {
  const [username, setUsername] = useState(""); // To store the username
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [recipient, setRecipient] = useState(""); // For recipient's username
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false); // To check if username is submitted
  const [activeChats, setActiveChats] = useState([]); // Store active chats for multiple recipients
  const [newRecipient, setNewRecipient] = useState(""); // New recipient for new chat

  useEffect(() => {
    if (username && isUsernameSubmitted) {
      // Register the user when they enter a username
      socket.emit("register_user", username);
    }

    const handleReceiveMessage = (data) => {
      setChat((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [username, isUsernameSubmitted]);

  const sendMessage = (recipient) => {
    if (message.trim() && recipient) {
      socket.emit("send_message", { message, username, recipient });
      setMessage(""); // Clear message input
    }
  };

  const handleSubmitUsername = () => {
    if (username.trim()) {
      setIsUsernameSubmitted(true); // Mark username as submitted
    }
  };

  const addChatWindow = () => {
    if (newRecipient.trim() && !activeChats.includes(newRecipient)) {
      setActiveChats((prevChats) => [...prevChats, newRecipient]);
      setNewRecipient(""); // Clear the new recipient input
    }
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      {!isUsernameSubmitted ? (
        <div className="login-container">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleSubmitUsername}>Submit</button>
        </div>
      ) : (
        <div className="chat-wrapper">
          {/* Sidebar with Active Chats */}
          <div className="sidebar">
            <h3>Recipient</h3>
            <input
              type="text"
              placeholder="Recipient username"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <button onClick={() => sendMessage(recipient)}>Send</button>
            
            {/* Add New Chat */}
            <div className="add-chat">
              <h4>Add New Chat</h4>
              <input
                type="text"
                placeholder="New recipient"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
              />
              <button onClick={addChatWindow}>Add Chat</button>
            </div>

            {/* Active chats */}
            <div className="active-chats">
              {activeChats.map((chatUser, index) => (
                <button key={index} onClick={() => setRecipient(chatUser)}>
                  Chat with {chatUser}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-box">
            <div className="messages">
              {chat.map((msg, i) => (
                <p key={i} className="message">
                  <strong>{msg.username}:</strong> {msg.message}
                </p>
              ))}
            </div>

            <div className="input-area">
              <input
                type="text"
                placeholder="Type your message..."
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(recipient)}
              />
              <button onClick={() => sendMessage(recipient)}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
