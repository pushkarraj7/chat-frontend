import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Chat.css";

// const socket = io("http://localhost:5000"); // change to backend URL
const socket = io("https://chat-backend-uj3u.onrender.com");

const Chat = () => {
  const [username, setUsername] = useState("");
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [activeChats, setActiveChats] = useState([]);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Register user and set up chat listener
  useEffect(() => {
    if (username && isUsernameSubmitted) {
      socket.emit("register_user", username);
    }

    // Listen to messages from the socket server
    const handleReceiveMessage = (data) => {
      // Check if the received message matches the active chat
      if (
        (data.sender === recipient && data.recipient === username) ||
        (data.sender === username && data.recipient === recipient)
      ) {
        setChat((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [username, recipient, isUsernameSubmitted]);

  // Fetch previous messages between sender and recipient
  useEffect(() => {
    if (recipient) {
      socket.emit("load_messages", { sender: username, recipient });

      socket.on("previous_messages", (messages) => {
        setChat(messages);
      });

      return () => socket.off("previous_messages");
    }
  }, [recipient, username]);

  const handleSubmitUsername = () => {
    if (username.trim()) {
      setIsUsernameSubmitted(true);
    }
  };

  const addChatWindow = () => {
    if (newRecipient.trim() && !activeChats.includes(newRecipient)) {
      setActiveChats((prev) => [...prev, newRecipient]);
      setRecipient(newRecipient);
      setNewRecipient("");
    }
  };

  const sendMessage = () => {
    if (message.trim() && recipient) {
      socket.emit("send_message", {
        sender: username,
        recipient,
        message,
      });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
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
          {/* Sidebar - Active Chats */}
          <div className="sidebar">
            <h3>Chats</h3>
            {activeChats.map((chatUser, index) => (
              <button
                key={index}
                className={recipient === chatUser ? "active" : ""}
                onClick={() => setRecipient(chatUser)}
              >
                {chatUser}
              </button>
            ))}

            <div className="add-chat">
              <input
                type="text"
                placeholder="New recipient"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
              />
              <button onClick={addChatWindow}>Add Chat</button>
            </div>
          </div>

          {/* Main Chat Box */}
          <div className="chat-box">
            <h4>Chat with {recipient || "..."}</h4>
            <div className="messages">
              {chat.map((msg, i) => (
                <p key={i} className="message">
                  <strong>{msg.sender}:</strong> {msg.message}
                </p>
              ))}
            </div>

            <div className="input-area">
              <input
                type="text"
                placeholder="Type your message..."
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
