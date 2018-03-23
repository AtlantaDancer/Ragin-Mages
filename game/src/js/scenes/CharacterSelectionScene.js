import Checkbox from 'objects/ui/Checkbox';

export default class CharacterSelectionScene extends Phaser.Scene {

  constructor() {
    super({key: 'CharacterSelectionScene'});
  }
  init(data){
    this._userMode=data.type;
    console.log('user mode=' + this._userMode);
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

    let btnX=200;
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
      console.log('User selected' + obj.label + ' checked', obj.isChecked() ? 'yes' : 'no');
      console.log('character key=' + obj.scene.characterKey);
      if(obj.isChecked()) {
        if( obj.scene.characterKey!='' ) {
          console.log('starting game scene as ' + obj.scene.characterKey );
          
          obj.scene.continue=true;  
        }
        else{
          
          console.log('in error if');
          obj.scene._errorText= obj.scene.add.text(100, obj.scene.lastButtonY, 'Please select a character before continuing', {
            font: '14px Arial',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: '6',
            shadowFill: '#FF0000',
            shadowStroke: '#FF0000',
            shadowOffsetY: '10',
            shadowBlur: '5'
          });
          obj.setChecked(false);
        }
      }

    })  
  }

  _addCharacterButton(btnData,scene,x,y){
    let chkButton = new Checkbox(scene, x, y, btnData.label , false);
    chkButton.key=btnData.key;
    chkButton.scene=scene;
    chkButton.onPointerDown(scene._HandleCharacterButtons);

  }
  _HandleCharacterButtons(obj){
    console.log('User selected' + obj.key + ' checked', obj.isChecked() ? 'yes' : 'no');

    if(obj.isChecked()) {
      obj.scene.characterKey=obj.key;
      obj.scene._errorText.destroy();
    }
    else {
      if (obj.scene.characterKey==obj.key){
        obj.scene.characterKey='';
      }
    }
  }  

  update() {
    if (this.continue )  {
      if (this._userMode=='multi_player') {
        console.log('starting multi-player for mode ' + this._userMode);
        this.scene.start('GameScene',{character: this.characterKey});  
      }
      else {
        console.log('starting single-player for mode ' + this._userMode);
        this.scene.start('DungeonScene',{character: this.characterKey});
      }
    }
  }
}