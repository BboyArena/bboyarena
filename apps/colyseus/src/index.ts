import http from 'node:http';
import { Server, Room } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';

type BattleState = {
  roomName: string;
  players: Array<{ id: string; name: string }>;
};

class BattleRoom extends Room<BattleState> {
  maxClients = 8;

  onCreate() {
    this.setState({
      roomName: 'street-battle',
      players: [],
    });

    this.onMessage('joinCrew', (client, message: { name?: string }) => {
      const name = message?.name?.trim() || 'Unknown';
      const existing = this.state.players.find((player) => player.id === client.sessionId);

      if (existing) {
        existing.name = name;
        return;
      }

      this.state.players.push({
        id: client.sessionId,
        name,
      });
    });

    this.onMessage('ping', (client) => {
      client.send('pong', { ok: true });
    });
  }

  onJoin(client: any) {
    this.state.players.push({
      id: client.sessionId,
      name: `Player-${this.clients.length}`,
    });
  }

  onLeave(client: any) {
    this.state.players = this.state.players.filter((player) => player.id !== client.sessionId);
  }
}

const port = Number(process.env.PORT || 2567);
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Colyseus street battle server');
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define('battle', BattleRoom);

httpServer.listen(port, () => {
  console.log(`Colyseus server listening on :${port}`);
});
