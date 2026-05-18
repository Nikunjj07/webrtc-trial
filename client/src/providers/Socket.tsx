import React, { useMemo, useEffect, createContext, useContext, type FC } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextValue = {
    socket: Socket | null;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const useSocket = (): SocketContextValue => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
};

export const SocketProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const socket = useMemo(() => io("http://localhost:8001"), []);

    useEffect(() => {
        return () => {
            socket?.disconnect();
        };
    }, [socket]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};