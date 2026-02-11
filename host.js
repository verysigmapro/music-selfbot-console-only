const Express = require('express');
const WebSocket = require('ws');
const Path = require('path');
const Fs = require('fs');
const Http = require('http');

const ExpressApp = Express();
const HttpServer = Http.createServer(ExpressApp);
const WsServer = new WebSocket.Server({ server: HttpServer });
const AudioDirectory = Path.join(__dirname, 'audio');

if (!Fs.existsSync(AudioDirectory)) Fs.mkdirSync(AudioDirectory);

const BroadcastData = (Data) => {
    const Payload = JSON.stringify(Data);
    WsServer.clients.forEach(Client => {
        if (Client.readyState === WebSocket.OPEN) Client.send(Payload);
    });
};

WsServer.on('connection', (Socket) => {
    Socket.on('message', (RawData) => {
        try {
            const ParsedData = JSON.parse(RawData);
            if (ParsedData.Type === 'Init') {
                Socket.BotId = ParsedData.Id;
                process.stdout.write(`\r\x1b[32m[LOGIN]\x1b[0m Bot: ${ParsedData.Username} (${ParsedData.Id}) is Ready\n> `);
            }
        } catch (Error) {}
    });
});

ExpressApp.use(Express.json());
ExpressApp.post('/join', (Req, Res) => { BroadcastData({ Type: 'Join' }); Res.json({ Status: 'OK' }); });
ExpressApp.post('/stop', (Req, Res) => { BroadcastData({ Type: 'Stop' }); Res.json({ Status: 'OK' }); });
ExpressApp.post('/play', (Req, Res) => {
    BroadcastData({ Type: 'Play', PlayTime: Date.now() + 800, AudioKey: Req.body.AudioKey });
    Res.json({ Status: 'OK' });
});

HttpServer.listen(3000, '0.0.0.0');
