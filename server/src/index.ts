import express from "express"
import { Server } from "socket.io"
import bodyParser from "body-parser";

const app = express();
const io = new Server({
    cors: {
        origin: "*"
    },
});

app.use(bodyParser.json())

const usernameToSocket = new Map();
const socketToUsername = new Map();

io.on("connection", (socket)=>{
    console.log("new connection!")
    socket.on("room-join",(data)=>{
        const {roomId, Name} = data;
        console.log("room joined!") 
        usernameToSocket.set(Name, socket.id);
        socketToUsername.set(socket.id, Name);
        const remoteSocketId = socket.id;
        socket.join(roomId);
        socket.emit('joined-room', {roomId})
        socket.broadcast.to(roomId).emit("user-joined", {Name, from: remoteSocketId});
    })

    socket.on("call-user",(data)=>{
        const {Name, offer} = data;
        const socketId = usernameToSocket.get(Name);
        const fromUser = socketToUsername.get(socket.id);
        socket.to(socketId).emit("incoming-call", {from: fromUser, offer})
    })

    socket.on("call-accept",(data)=>{
        const {from, answer} = data;
        const socketId = usernameToSocket.get(from);
        socket.to(socketId).emit("call-accepted",{ answer })
    })

    socket.on("nego-needed",(data)=>{
        const {offer, to} = data;
        socket.to(to).emit("peer-nego-needed",{
            from: socket.id,
            offer
        })
    })

    socket.on("peer-nego-done",(data)=>{
        const {to, ans} = data;
        socket.to(to).emit("peer-nego-final",{from: socket.id, ans})
    })
})

app.listen(8000,()=>{
    console.log("server started!")
})
io.listen(8001)