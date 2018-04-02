
export default class LeaderBoard {
  constructor(playerManager, socketio) {
    this.io = socketio;
    this.playerManager = playerManager;
    this.players=[];
    // this.io.on('die', this.playerDie.bind(this));
  }

  AddPlayer(player){
    //add player to leader board
    this.players.push(
      player
    );
  }
  AddToKillCount(id){
    let index=this.players.findIndex((value) =>  value.id==id);
    if (index>-1) {
      console.log('add kill found',this.players)
      this.players[index].stats.kills ++;
    }
  }
  ResetPlayer(id){
    let index=this.findIndex((value) =>  value.id==id);
    if (index>-1) {
      this.players[index].resetStats() ;
    }

  }
  RemovePlayer(id) {
    const delIndex=this.leaderBoard.findIndex((value) =>  value.id==id);
    console.log('delete item',delIndex,this.leaderBoard[delIndex]);
    if (delIndex>-1) {
      this.splice(delIndex,1);
    }

  }
  UpdateRankings(){
    console.log('updating rankings');
    this.sort(function(char1,char2)  {
      if (char1.kills < char2.kills)
        return 1;
      if (char1.kills > char2.kills)
        return -1;
      return 0;
    });

    this.forEach( function (character,index) {
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