import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export default class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload ()
    {
        
    }

    create ()
    {    
        const background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setScale(this.cameras.main.width / background.width, this.cameras.main.height / background.height);
           
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        
        EventBus.emit('current-scene-ready', this);

        this.scene.start('CustomCharacter');
    }
}
