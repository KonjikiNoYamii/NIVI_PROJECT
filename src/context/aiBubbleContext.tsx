import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AiBubble = {
  comment: string;
  tone: "positif" | "netral" | "peringatan";
  confidence: number;
};

type ContextType = {
  bubble: AiBubble | null;
  clearBubble: () => void;
};

const AiBubbleContext = createContext<ContextType>({
  bubble: null,
  clearBubble: () => {},
});

export const AiBubbleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [bubble, setBubble] = useState<AiBubble | null>(null);

  useEffect(() => {
  (async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { userId }, // ⬅️ JOIN ROOM SEBELUM CONNECT
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected as user-" + userId);
    });

    socket.on("ai-bubble", (data: AiBubble) => {
      console.log("🤖 AI Bubble received:", data);
      setBubble(data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  })();

  return () => {
    socketRef.current?.disconnect();
  };
}, []);


  const clearBubble = () => setBubble(null);

  return (
    <AiBubbleContext.Provider value={{ bubble, clearBubble }}>
      {children}
    </AiBubbleContext.Provider>
  );
};

export const useAiBubble = () => useContext(AiBubbleContext);
