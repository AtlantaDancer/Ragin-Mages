import Checkbox from 'objects/ui/Checkbox';

export default class CharacterSelectionScene extends Phaser.Scene {

  constructor() {
    super({key: 'CharacterSelectionScene'});
  }

  preload() {
    this.assets =  this.cache.json.get('assets');
  }
    
  create() {

    this.add.text(50, 0, 'Select your character then click continue', {
      font: '18px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: '6',
      shadowFill: '#ffffff',
      shadowStroke: '#ffffff',
      shadowOffsetY: '10',
      shadowBlur: '5'
    });

    let btnX=70;
    let btnY=50;
    let btnSpacing=50;
    for(let character of this.assets.characters) {
      this._addCharacterButton(character,this,btnX,btnY );
      btnY +=btnSpacing;
    }
    let chkContinue = new Checkbox(this, btnX, btnY, 'Continue', false);
    this.lastButtonY=btnY+=btnSpacing;

    this.characterKey='';
    this.continue=false;

    chkContinue.scene=this;
    chkContinue.onPointerDown(function(obj) {
      console.log('User selected' + obj.text + ' checked', obj.isChecked() ? 'yes' : 'no');

      if(obj.isChecked() && obj.scene.characterKey!='' ) {
        console.log('starting game scene as ' + obj.scene.characterKey );
        
        obj.scene.continue=true;  
      }
      else{
        if (!obj.isChecked && obj.scene.characterKey=='') {
          obj.scene.add.text(50, obj.scene.lastButtonY, 'No really select a character', {
            font: '14px Arial',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: '6',
            shadowFill: '#FF0000',
            shadowStroke: '#FF0000',
            shadowOffsetY: '10',
            shadowBlur: '5'
          });
        }
      }

    })  
  }

  _addCharacterButton(btnData,scene,x,y){
    let chkKnight = new Checkbox(scene, x, y, btnData.label , false);
    chkKnight.key=btnData.key;
    chkKnight.scene=scene;
    chkKnight.onPointerDown(scene._HandleCharacterButtons);

  }
  _HandleCharacterButtons(obj){
    console.log('User selected' + obj.key + ' checked', obj.isChecked() ? 'yes' : 'no');

    if(obj.isChecked()) {
    //        serviceWorker.register();
      obj.scene.characterKey=obj.key;
    }
    else {
      if (obj.scene.characterKey==obj.key){
        obj.scene.characterKey='';
      }
    //        serviceWorker.unregister();
    }
  }  

  update() {
    if (this.continue) {
      this.scene.start('GameScene');  
    }
  }
}