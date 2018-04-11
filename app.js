const http = require('http');
const WS = require('ws');
const createDb = require('./db');

const server = http.createServer();
const wss = new WS.Server({server});
const db = createDb();
const host = process.env.HOST;
const port = process.env.PORT || 3000;

/**
 * @param {WS.Client} client Client to emit data
 * @param {object} data Data to send
 */
const send = (client, data) => {
  client.send(JSON.stringify(data));
};

/**
 * Broadcast data to all clients
 * @param {any} data Data to send
 * @param {WS.Client} [client=null] Client to skip
 */
const broadcast = (data, client = null) => {
  wss.clients.forEach(nextClient => {
    if (client && client === nextClient) {
      return;
    }

    if (nextClient.readyState === WS.OPEN) {
      send(nextClient, data);
    }
  });
};

const DELETE_COMMENT = 'DELETE_COMMENT';
const GET_COMMENTS = 'GET_COMMENTS';

const sendComments = client => {
  const comments = db.getComments();
  send(client, {action: GET_COMMENTS, payload: {comments}});
};

wss.on('connection', connection => {
  sendComments(connection);

  connection.on('message', message => {
    const {action, payload} = JSON.parse(message);

    switch (action) {
      case DELETE_COMMENT: {
        const {id} = payload;
        db.deleteComment(payload.id) &&
          broadcast({action: DELETE_COMMENT, payload: {id}});
        return;
      }
      case GET_COMMENTS: {
        sendComments(connection);
        return;
      }
    }
  });
});

server.listen({host, port}, () => {
  console.log(`Websocket server listening on ${host || ''}:${port}`);
});
