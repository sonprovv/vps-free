const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupConversationListener } = require('./listener.js');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

// Khởi tạo listener cho tin nhắn
setupConversationListener();
console.log('🔊 Message listener initialized');

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
