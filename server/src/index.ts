import express from "express"
import { Server } from "socket.io"
import bodyParser from "body-parser";

const app = express();
const io = new Server();

app.use(bodyParser.json())

const usernametosocket = new Map();

io.on("connection", (socket)=>{
    socket.on("room-join",(data)=>{
        const {roomId, Name} = data;
        usernametosocket.set(Name, socket.id)
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("User Joined - ", {Name});
    })
})

app.listen(8000,()=>{
    console.log("server started!")
})
io.listen(8001)