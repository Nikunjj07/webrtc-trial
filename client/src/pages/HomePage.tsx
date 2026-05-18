import { useEffect, useState } from "react";
import { useSocket } from "../providers/Socket"
import { useNavigate } from "react-router-dom";


export function HomePage (){
    const {socket} = useSocket();
    const navigate = useNavigate();
    if (!socket) return null;
    const [Name, setName] = useState("")
    const [roomId, setRoomId] = useState("")

    const handleRoomJoin = () =>{
        socket.emit("room-join", {Name, roomId})
    }

    const handleRoomJoined = ({roomId}: {roomId: string})=>{
        navigate(`/room/${roomId}`)
    }

    useEffect(()=>{
        socket.on('joined-room',handleRoomJoined)
    },[socket])

    return <div className="flex items-center justify-center h-screen">
        <div id="input-container" className="border p-10 text-lg flex flex-col">
            <input className="border rounded-lg p-2 m-2" type="text" placeholder="Name" onChange={(e)=>{
                setName(e.target.value)
            }}/>
            <input className="border rounded-lg p-2 m-2" type="text" placeholder="Room Code" onChange={(e)=>{
                setRoomId(e.target.value)
            }}/>
            <button onClick={handleRoomJoin} className="border rounded-lg p-2 m-2">Enter</button>
        </div>
    </div>
}