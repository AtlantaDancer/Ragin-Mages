import uuidv4  from 'uuid/v4';
const NoRank=null;
export default class PlayerManager {
  constructor(socketio) {
    this.io = socketio;
    this.lobbyPlayerMap = new Map();
    this.gamePlayerMap = new Map();
    this.leaderBoard=[];
    this.io.on('connection', this.playerConnected.bind(this));
  }

  playerConnected(socket) {
    socket.id = uuidv4();
    this.lobbyPlayerMap.set(socket.id, socket);
    socket.emit('setId', socket.id);

    console.log('Player connected', socket.id);
    console.log('connect',this.lobbyPlayerMap.size + this.gamePlayerMap.size, 'players connected,', this.gamePlayerMap.size, 'in game');

    socket.on('disconnect', () => {
      this.playerDisconnected(socket);
    });

    //Handle messages sent by players
    socket.on('joinGame', (character, handle) => {
      console.log('joinGame', socket.id);
      //Store attributes locally
      socket.character = character;
      socket.handle = handle;
      socket.x = Math.random() * 400 - 200;
      socket.y = Math.random() * 400 - 200;
      //Create a list of existing connected players
      let existingPlayers = [];
      for(let [key, value] of this.gamePlayerMap) {
        existingPlayers.push({
          id: value.id,
          handle: value.handle,
          character: value.character,
          x: value.x,
          y: value.y,
          orientation: value.orientation
        });
      } 
      
      //Move player from lobby to game list
      this.lobbyPlayerMap.delete(socket.id);
      this.gamePlayerMap.set(socket.id, socket);
      //Send player list to new player
      socket.emit('existingPlayers', existingPlayers);
      //Notify everyone of this new player
      socket.broadcast.emit('playerJoined', socket.id, character, handle, socket.x, socket.y);
      console.log('join',this.lobbyPlayerMap.size + this.gamePlayerMap.size, 'players connected,', this.gamePlayerMap.size, 'in game');
    
      //add player to leader board
      this.leaderBoard.push({
        id: socket.id,
        handle: handle,
        kills: 0,
        currentRank:0,
        highestRank:NoRank
      } );
      console.log('join leaderboard',this.leaderBoard);
      console.log('join Leaderboard length',this.leaderBoard.length);
    });
    
    socket.on('setMotion', (posX, posY, vecX, vecY) => {
      socket.x = posX;
      socket.y = posY;
      socket.motionVector = {x: vecX, y: vecY};
      socket.broadcast.emit('setMotion', socket.id, posX, posY, vecX, vecY);
    });

    socket.on('setPosition', (x, y, orientation) => {
      socket.x = x;
      socket.y = y;
      socket.orientation = orientation;
      socket.broadcast.emit('setPosition', socket.id, x, y, orientation);
    });

    
    socket.on('fire', (posX, posY, toX, toY) => {
      socket.x = posX;
      socket.y = posY;
      socket.broadcast.emit('playerFired', socket.id, posX, posY, toX, toY);
    });

    socket.on('death', (posX, posY, killedById) => {
      socket.x = posX;
      socket.y = posY;
      socket.broadcast.emit('playerDied', socket.id, posX, posY, killedById);
      console.log('death');
      let index=this.leaderBoard.findIndex((value) =>  value.id==killedById);
      if (index>-1) {
        this.leaderBoard[index].kills ++;
      }
      index=this.leaderBoard.findIndex((value) =>  value.id==socket.id);
      if (index>-1) {
        this.leaderBoard[index].kills = 0;
        this.leaderBoard[index].highestRank=NoRank;
      }
      console.log('death by', killedById,this.leaderBoard);
      this.UpdateRankings();
    });

    socket.on('respawn', () => {
      socket.x = Math.random() * 400 - 200;
      socket.y = Math.random() * 400 - 200;
      //Notify everyone of this new player
      socket.broadcast.emit('playerJoined', socket.id, socket.character, socket.handle, socket.x, socket.y);
      console.log('respawn', this.lobbyPlayerMap.size + this.gamePlayerMap.size, 'players connected,', this.gamePlayerMap.size, 'in game');

      const index=this.leaderBoard.findIndex((value) =>  value.id==socket.id);
      if (index>-1) {
        this.leaderBoard[index].kills = 0;
      }
      console.log('respawn', socket.id,this.leaderBoard);
      this.UpdateRankings();
    });

    socket.on('exitGame', () => {
      this.gamePlayerMap.delete(socket.id);
      // for now don't move them to the lobby they rejoin with new ID if they exit/re-enter
      // this.lobbyPlayerMap.set(socket.id, socket);
      this.lobbyPlayerMap.delete(socket.id);
      socket.broadcast.emit('playerExited', socket.id);

      console.log('exit leaderboard',this.leaderBoard,this.leaderBoard.length);
      const delIndex=this.leaderBoard.findIndex((value) =>  value.id==socket.id);
      console.log('delete item',delIndex,this.leaderBoard[delIndex]);
      if (delIndex>-1) {
        this.leaderBoard.splice(delIndex,1);
      }
      console.log('after delete',this.leaderBoard,this.leaderBoard.length);
      this.UpdateRankings();
    });
    
  }

  playerDisconnected(socket) {
    this.gamePlayerMap.delete(socket.id);
    this.lobbyPlayerMap.delete(socket.id);
    socket.broadcast.emit('playerDisconnected', socket.id);
    console.log('disconnect', this.lobbyPlayerMap.size + this.gamePlayerMap.size, 'players connected,', this.gamePlayerMap.size, 'in game');
    
    console.log('disc leaderbaord',this.leaderBoard, this.leaderBoard.length);
    const delIndex = this.leaderBoard.findIndex((value) => value.id==socket.id);
    this.leaderBoard.splice(delIndex,1);
    console.log('after del',this.leaderBoard,this.leaderBoard.length);
    this.UpdateRankings();
  }
  UpdateRankings(){
    console.log('updating rankings');
    this.leaderBoard.sort(function(char1,char2)  {
      if (char1.kills < char2.kills)
        return 1;
      if (char1.kills > char2.kills)
        return -1;
      return 0;
    });

    this.leaderBoard.forEach( function (character,index) {
      if (character.kills>0) {
        character.currentRank=index+1;
        if (character.currentRank<character.highestRank || character.highestRank==null) {
          character.highestRank=character.currentRank;
        //send message to client of their updated ranking
          // socket.emit('setId', socket.id);
        }
      }
    })
  }
}