import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        

        this.load.image('background', 'bg.png');

    }

    create ()
    {
        
        const background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setScale(this.cameras.main.width / background.width, this.cameras.main.height / background.height);
        

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        
        EventBus.emit('current-scene-ready', this);

    }
}
