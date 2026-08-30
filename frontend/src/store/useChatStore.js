
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

  isUsersLoading: false,
  isMessagesLoading: false,

  // =========================
  // TYPING INDICATOR
  // =========================
  isTyping: false,

  // =========================
  // GET USERS
  // =========================
  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");

      set({
        users: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // =========================
  // GET MESSAGES
  // =========================
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      set({
        messages: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // =========================
  // SEND MESSAGE
  // =========================
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({
        messages: [...messages, res.data],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );
    }
  },

  // =========================
  // ADD REACTION
  // =========================
  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(
        `/messages/${messageId}/reaction`,
        {
          emoji,
        }
      );

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId ? res.data : message
        ),
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add reaction"
      );
    }
  },

  // =========================
  // SOCKET SUBSCRIPTION
  // =========================
  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    // =========================
    // NEW MESSAGE
    // =========================
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // =========================
    // USER STARTED TYPING
    // =========================
    socket.on("userTyping", () => {
      set({
        isTyping: true,
      });
    });

    // =========================
    // USER STOPPED TYPING
    // =========================
    socket.on("userStoppedTyping", () => {
      set({
        isTyping: false,
      });
    });

    // =========================
    // MESSAGE REACTION UPDATED
    // =========================
    socket.on("messageReactionUpdated", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === updatedMessage._id
            ? updatedMessage
            : message
        ),
      }));
    });
  },

  // =========================
  // UNSUBSCRIBE SOCKET
  // =========================
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messageReactionUpdated");

    set({
      isTyping: false,
    });
  },

  // =========================
  // START TYPING
  // =========================
  startTyping: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.emit("typing", {
      receiverId: selectedUser._id,
    });
  },

  // =========================
  // STOP TYPING
  // =========================
  stopTyping: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.emit("stopTyping", {
      receiverId: selectedUser._id,
    });
  },

  // =========================
  // SELECT USER
  // =========================
  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      isTyping: false,
    }),
}));

