"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const io = new socket_io_1.Server({
    cors: {
        origin: "*"
    },
});
app.use(body_parser_1.default.json());
const usernametosocket = new Map();
io.on("connection", (socket) => {
    console.log("new connection!");
    socket.on("room-join", (data) => {
        const { roomId, Name } = data;
        console.log("room joined!");
        usernametosocket.set(Name, socket.id);
        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        socket.broadcast.to(roomId).emit("user-joined - ", { Name });
    });
});
app.listen(8000, () => {
    console.log("server started!");
});
io.listen(8001);
