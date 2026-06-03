import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

interface PeerProviderProps {
    children: ReactNode
}

interface PeerContextValue {
    peer: RTCPeerConnection,
    createOffer: () => Promise<RTCSessionDescriptionInit>,
    createAnswer: (offer: any) => Promise<RTCSessionDescriptionInit>,
    setRemoteAnswer: (ans: any) => Promise<void>,
    sendStream: (stream: any) => Promise<void>,
    remoteStream: MediaStream | null | undefined
}

export const usePeer = ()=> useContext(PeerContext)

const PeerContext = createContext<PeerContextValue | null>(null)

export const PeerProvider = (props: PeerProviderProps)=>{
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
    const peer = useMemo(()=>{
        return new RTCPeerConnection({
            iceServers:[
                {
                    urls:[ 
                        "stun:stun.l.google.com:19302" ,
                        "stun:stun4.l.google.com:5349"]
                }
            ]
        })
    },[])

    const createOffer = async()=>{
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async(offer:any)=>{
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async(ans:any)=>{
        await peer.setRemoteDescription(ans)
    }

    const sendStream = async(stream:any)=>{
        const tracks = stream.getTracks();
        for (const track of tracks){
            peer.addTrack(track,stream);
        }
    }

    const handleTrackEvent = useCallback(async(ev:any)=> {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    },[])

    useEffect(()=>{
        peer.addEventListener("track",handleTrackEvent);

        return ()=>{
            peer.removeEventListener("track", handleTrackEvent)
        }
    },[peer])

    return <PeerContext.Provider value={{peer , createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream}}>
        {props.children}
    </PeerContext.Provider>
}