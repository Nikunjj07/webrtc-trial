import { createContext, useContext, useMemo } from "react"
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
}

export const usePeer = ()=> useContext(PeerContext)

const PeerContext = createContext<PeerContextValue | null>(null)

export const PeerProvider = (props: PeerProviderProps)=>{
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

    return <PeerContext.Provider value={{peer , createOffer, createAnswer, setRemoteAnswer, sendStream}}>
        {props.children}
    </PeerContext.Provider>
}