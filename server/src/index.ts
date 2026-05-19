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

const usernametosocket = new Map();

io.on("connection", (socket)=>{
    console.log("new connection!")
    socket.on("room-join",(data)=>{
        const {roomId, Name} = data;
        console.log("room joined!") 
        usernametosocket.set(Name, socket.id)
        socket.join(roomId);
        socket.emit('joined-room', {roomId})
        socket.broadcast.to(roomId).emit("user-joined - ", {Name});
    })
})

app.listen(8000,()=>{
    console.log("server started!")
})
io.listen(8001)