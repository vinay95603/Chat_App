import EmojiPicker from "emoji-picker-react";
import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, startTyping, stopTyping } = useChatStore();

  // =========================
  // EMOJI CLICK
  // =========================
  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // =========================
  // IMAGE CHANGE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // TEXT CHANGE / TYPING
  // =========================
  const handleTextChange = (e) => {
    const value = e.target.value;

    setText(value);

    if (value.trim()) {
      console.log("⌨️ USER IS TYPING");

      startTyping();

      // Clear previous timeout
      clearTimeout(typingTimeoutRef.current);

      // Stop typing after 1 second
      typingTimeoutRef.current = setTimeout(() => {
        console.log("🛑 USER STOPPED TYPING");
        stopTyping();
      }, 1000);
    } else {
      clearTimeout(typingTimeoutRef.current);
      stopTyping();
    }
  };

  // =========================
  // REMOVE IMAGE
  // =========================
  const removeImage = () => {
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    try {
      // Stop typing
      stopTyping();
      clearTimeout(typingTimeoutRef.current);

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full relative">
      {/* =========================
          EMOJI PICKER
      ========================= */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
          />
        </div>
      )}

      {/* =========================
          IMAGE PREVIEW
      ========================= */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />

            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* =========================
          MESSAGE FORM
      ========================= */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2"
      >
        <div className="flex-1 flex gap-2 items-center">
          {/* =========================
              EMOJI BUTTON
          ========================= */}
          <button
            type="button"
            className={`btn btn-circle btn-ghost ${
              showEmojiPicker ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {/* =========================
              TEXT INPUT
          ========================= */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
          />

          {/* =========================
              FILE INPUT
          ========================= */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* =========================
              IMAGE BUTTON
          ========================= */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        {/* =========================
            SEND BUTTON
        ========================= */}
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

