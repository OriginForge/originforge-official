import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export default class PreLoad extends Scene
{
    constructor ()
    {
        super('PreLoad');
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.spritesheet('earthPlanet', 'earthPlanet.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('nodePlanet', 'nodePlanet.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('blackHole', 'blackHole.png', { frameWidth: 256, frameHeight: 256 });
    }

    create ()
    {    
        // loading screen
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Loading...', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
        this.scene.start('Register');

    }


    

}
