import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../providers/Socket"
import { usePeer } from "../providers/Peer";

export function Lobby(){

    const peerContext = usePeer();
    const { socket } = useSocket();
    if (!socket || !peerContext) return null;
    const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream } = peerContext;
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [remoteSocketId, setRemoteSocketId] = useState()
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
    
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);

    const handleIncomingCall = useCallback(async(data : any)=>{
        const { from, offer} = data;
        console.log("Incoming Call from ", from, "with offer: ", offer);
        const answer = await createAnswer(offer);
        console.log("answer created: ", answer);
        socket.emit("call-accept",{ from, answer});
    },[createAnswer, socket])

    const handleNewUserJoined = useCallback(async(data: {Name: string, from : any})=>{
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const {Name, from} = data || {};
        console.log("New User Joined: ",Name);
        setRemoteSocketId(from)
        const offer = await createOffer()
        socket.emit("call-user",{ Name, offer})
    },[createOffer, socket])

    const handleCallAccepted = useCallback(async(data : any)=>{
        const { answer } = data;
        console.log("call accepted and remote ans ", answer)
        await setRemoteAnswer(answer);
        setCallAccepted(true);
    },[setRemoteAnswer])

    const getUserMediaStream = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);
    },[])

    const handleTrackEvent = useCallback(async(ev:any)=> {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    },[remoteStream])

    const handleNegoNeeded = useCallback(async()=>{
        const offer = await createOffer();
        socket.emit("nego-needed",{offer, to: remoteSocketId})
    },[])


    const handleIncomingNego = useCallback(async({from , offer}:{from: any, offer: any})=>{
        const ans = await createAnswer(offer);
        socket.emit("peer-nego-done",{to: from, ans});
        console.log("nego done!!");
    },[socket])

    const handleNegoFinal = useCallback(async({ans}:{ans: any})=>{
        await peer.setLocalDescription(ans)
    },[])

    useEffect(()=>{
        peer.addEventListener("negotiationneeded",handleNegoNeeded);

        return ()=>{
            peer.removeEventListener("negotiationneeded",handleNegoNeeded);
        }
    },[])

    useEffect(()=>{
        peer.addEventListener("track",handleTrackEvent);

        return ()=>{
            peer.removeEventListener("track", handleTrackEvent)
        }
    },[peer, handleTrackEvent])

    useEffect(()=>{
        socket.on("user-joined",handleNewUserJoined);
        socket.on("incoming-call",handleIncomingCall);
        socket.on("call-accepted",handleCallAccepted);
        socket.on("peer-nego-needed",handleIncomingNego);
        socket.on("peer-nego-final",handleNegoFinal);

        return()=>{
            socket.off("user-joined",handleNewUserJoined);
            socket.off("incoming-call",handleIncomingCall);
            socket.off("call-accepted",handleCallAccepted);
            socket.off("peer-nego-needed",handleIncomingNego);
            socket.off("peer-nego-final",handleNegoFinal);
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

    useEffect(() => {
        if (!callAccepted || !myStream) return;
        sendStream(myStream)
            .then(() => console.log("stream sent"))
            .catch((err) => console.error("sendStream failed", err));
    }, [callAccepted, myStream, sendStream]);

    return <div>
        Room
        WebRTC Practice
        <div className="rounded-xl bg-white px-6 py-8 shadow-sm">
            <video className="rounded-3xl bg-white shadow-sm" muted autoPlay playsInline ref={videoRef} />
            <video className="rounded-3xl bg-white shadow-sm"  autoPlay playsInline ref={remoteRef} />
        </div>
    </div>
}