
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    addReaction,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  // Message jis par reaction picker open hai
  const [activeReactionMessage, setActiveReactionMessage] = useState(null);

  // Available reactions
  const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  // =========================
  // GET MESSAGES + SOCKET
  // =========================
  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  // =========================
  // HANDLE REACTION
  // =========================
  const handleReaction = async (messageId, emoji) => {
    await addReaction(messageId, emoji);

    // Picker close
    setActiveReactionMessage(null);
  };

  // =========================
  // LOADING
  // =========================
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* =========================
          TYPING INDICATOR
      ========================= */}
      {isTyping && (
        <div className="px-4 py-1 text-sm text-zinc-400">
          {selectedUser.fullName} is typing...
        </div>
      )}

      {/* =========================
          MESSAGES
      ========================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${
                isOwnMessage ? "chat-end" : "chat-start"
              }`}
            >
              {/* =========================
                  AVATAR
              ========================= */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* =========================
                  MESSAGE HEADER
              ========================= */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* =========================
                  MESSAGE + REACTION
              ========================= */}
              <div className="relative group">
                {/* REACTION PICKER BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveReactionMessage(
                      activeReactionMessage === message._id
                        ? null
                        : message._id
                    )
                  }
                  className={`absolute ${
                    isOwnMessage
                      ? "-left-10"
                      : "-right-10"
                  } top-1/2 -translate-y-1/2
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                  text-lg
                  hover:scale-110`}
                  title="React"
                >
                  😊
                </button>

                {/* =========================
                    REACTION PICKER
                ========================= */}
                {activeReactionMessage === message._id && (
                  <div
                    className={`absolute z-50 bottom-full mb-2
                    ${
                      isOwnMessage
                        ? "right-0"
                        : "left-0"
                    }
                    bg-base-200 border border-base-300
                    rounded-full shadow-lg
                    px-2 py-1 flex gap-1`}
                  >
                    {reactions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          handleReaction(
                            message._id,
                            emoji
                          )
                        }
                        className="text-xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* =========================
                    MESSAGE BUBBLE
                ========================= */}
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {message.text && <p>{message.text}</p>}
                </div>

                {/* =========================
                    EXISTING REACTIONS
                ========================= */}
                {message.reactions &&
                  message.reactions.length > 0 && (
                    <div
                      className={`flex gap-1 mt-1 ${
                        isOwnMessage
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {[
                        ...new Set(
                          message.reactions.map(
                            (reaction) => reaction.emoji
                          )
                        ),
                      ].map((emoji) => {
                        const count =
                          message.reactions.filter(
                            (reaction) =>
                              reaction.emoji === emoji
                          ).length;

                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() =>
                              handleReaction(
                                message._id,
                                emoji
                              )
                            }
                            className="px-2 py-0.5 rounded-full
                            bg-base-200 border border-base-300
                            text-sm hover:scale-105 transition-transform"
                          >
                            {emoji} {count > 1 && count}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        {/* =========================
            SCROLL TARGET
        ========================= */}
        <div ref={messageEndRef} />
      </div>

      {/* =========================
          MESSAGE INPUT
      ========================= */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;