import BaseScene from './BaseScene';
import FireMonster from 'objects/characters/FireMonster';
import IceMonster from 'objects/characters/IceMonster';
import SpiderMonster from 'objects/characters/SpiderMonster';
import GolemMonster from 'objects/characters/GolemMonster';

export default class DungeonScene extends BaseScene {

  constructor() {
    super({ key: 'DungeonScene' });
  }
  init(data){
    this._userCharacter=data.character;
    console.log('user chose' + this._userCharacter);
  }
  preload() {
    
    this.characters = this.add.group();
    this.map1 = this.add.tilemap('dungeon_map');
    this.tileset1 = this.map1.addTilesetImage('stone-tiles', 'stone-tiles');
    this.layer1 = this.map1.createStaticLayer('Dungeon Map', this.tileset1, -500, -340);

    this.add.text(-390, -300, 'Dungeon Scene - Use the arrow keys for motion, spacebar to attack, k to die', {
      font: '16px Arial',
      fill: '#ffffff'
    });
  }

  create() {
    
    switch(this._userCharacter){

    case 'orb' :
      this.body.setCircle(20);
      break;
      
    case 'orb_p' :
      this.body.setCircle(15);
      break;
      
    case 'ven' :
      this.body.setCircle(10);
      break;
      
    case 'fire' :
      this.body.setCircle(30);
      break;
      
    case 'light' :
      this.body.setCircle(20);
      break;
      
    case 'ice' :
      this.body.setCircle(20);
      break;
    
    }
  
    this.fireMonster = new FireMonster(this, -100, 0);
    this.iceMonster = new IceMonster(this, 100, -100);
    this.spiderMonster = new SpiderMonster(this, -300, 100);
    this.golemMonster = new GolemMonster(this, -300, -100);

    this.cameras.main.startFollow(this.fireMonster);

    this.fightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.deathKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerdown', function(event) {
      if(event.buttons === 1) {
        this.fireMonster.moveTo(this.input.x, this.input.y);
      }
    }, this)

  }

  update() {
    let direction = null;
    let animation = 'walk';
    if (this.cursors.up.isDown) {
      direction = 'N';
      if (this.cursors.left.isDown) { //NW
        direction += 'W';
      }
      else if (this.cursors.right.isDown) { //NE
        direction += 'E';
      }
    }
    else if (this.cursors.down.isDown) {
      direction = 'S';
      if (this.cursors.left.isDown) { //NW
        direction += 'W';
      }
      else if (this.cursors.right.isDown) { //NE
        direction += 'E';
      }
    }
    else if (this.cursors.left.isDown) { //W
      direction = 'W';
    }
    else if (this.cursors.right.isDown) { //E
      direction = 'E';
    }
    else {
      animation = 'stance';
    }

    if(this.fightKey.isDown) {
      animation = 'fight';
    }

    if(this.deathKey.isDown) {
      animation = 'death';
    }

    this.iceMonster.setAnimation(animation, direction);
    this.fireMonster.setAnimation(animation, direction);
    this.spiderMonster.setAnimation(animation, direction);
    this.golemMonster.setAnimation(animation, direction);

    this.fireMonster.update();
  }
}