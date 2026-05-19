import { useEffect } from "react";
import { useSocket } from "../providers/Socket"

export function Lobby(){

    const { socket } = useSocket();
    if (!socket) return null;

    const handleNewUserJoined = (data: {Name: string})=>{
        const {Name} = data || {};
        console.log("New User Joined: ",Name);
    }

    useEffect(()=>{
        socket.on("user-joined",handleNewUserJoined);
    },[socket])

    return <div>
        Room
    </div>
}