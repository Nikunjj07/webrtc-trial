import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../providers/Socket"
import { usePeer } from "../providers/Peer";

export function Lobby(){

    const peerContext = usePeer();
    const { socket } = useSocket();
    if (!socket || !peerContext) return null;
    const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream } = peerContext;
    const [myStream, setMyStream] = useState<MediaStream | null>();
    
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);

    const handleIncomingCall = useCallback(async(data : any)=>{
        const { from, offer} = data;
        console.log("Incoming Call from ", from, "with offer: ", offer);
        const answer = await createAnswer(offer);
        console.log("answer created: ", answer);
        socket.emit("call-accept",{ from, answer});
    },[createAnswer, socket])

    const handleNewUserJoined = useCallback(async(data: {Name: string})=>{
        const {Name} = data || {};
        console.log("New User Joined: ",Name);
        const offer = await createOffer()
        socket.emit("call-user",{ Name, offer})
    },[createOffer, socket])

    const handleCallAccepted = useCallback(async(data : any)=>{
        const { answer } = data;
        console.log("call accepted and remote ans ", answer)
        await setRemoteAnswer(answer);
    },[])

    const getUserMediaStream = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);
    },[])

    useEffect(()=>{
        socket.on("user-joined",handleNewUserJoined);
        socket.on("incoming-call",handleIncomingCall);
        socket.on("call-accepted",handleCallAccepted);

        return()=>{
            socket.off("user-joined",handleNewUserJoined);
            socket.off("incoming-call",handleIncomingCall);
            socket.off("call-accepted",handleCallAccepted);
        }
    },[socket])

    useEffect(()=>{
        getUserMediaStream()
    },[getUserMediaStream])

    useEffect(() => {
        if (videoRef.current && myStream) {
        videoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        if (remoteRef.current && remoteStream) {
        remoteRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return <div>
        Room
        WebRTC Practice
        <div className="rounded-xl bg-white px-6 py-8 shadow-sm">
            <video className="rounded-3xl bg-white shadow-sm" muted autoPlay playsInline ref={videoRef} />
            <video className="rounded-3xl bg-white shadow-sm"  autoPlay playsInline ref={remoteRef} />
        </div>
    </div>
}