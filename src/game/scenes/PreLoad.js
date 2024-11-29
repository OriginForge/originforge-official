import { Scene } from 'phaser';
import { EventBus } from '../EventBus';


export default class PreLoad extends Scene
{
    constructor ()
    {
        super('PreLoad');
    }

    init() {
        // 로딩 텍스트 생성
        const loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Loading  ', {
            fontFamily: 'Pixelify Sans',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 픽셀 스타일의 로딩 도트 생성
        const dots = [];
        for (let i = 0; i < 3; i++) {
            const dot = this.add.rectangle(
                loadingText.x + 60 + (i * 15), 
                loadingText.y,
                8, 
                8,
                0xffffff
            ).setOrigin(0.5);
            dots.push(dot);
        }

        // 도트 애니메이션
        dots.forEach((dot, index) => {
            this.tweens.add({
                targets: dot,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                yoyo: true,
                repeat: -1,
                delay: index * 200
            });
        });

        // 로딩 텍스트 깜빡임 효과
        this.tweens.add({
            targets: loadingText,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
    }
    
    preload ()
    {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.image('registerBox_bg', 'registerBox_bg.png');
        // modal Box
        this.load.image('modalBox_bg', 'modalBox_bg2.png');
        
        this.load.image('exitBtn', 'exitBtn.png');
        this.load.image('prev_exitBtn', 'prev_exitBtn.png');
        this.load.image('characterBox', 'characterBox.png');
        this.load.image('characterBox_com', 'characterBox_com.png');
        this.load.image('character', 'character.png');
        this.load.image('character_name', 'character_name.png');
        this.load.image('character_name_com', 'character_name_com.png');
        // inventory
        this.load.image('inventory', 'inventory.png');
        this.load.image('inventory_select', 'inventory_select.png');
        // test items 
        this.load.spritesheet('item1', 'item1.png', { 
            frameWidth: 16, 
            frameHeight: 16 
        })
        this.load.spritesheet('item2', 'item2.png', { 
            frameWidth: 16, 
            frameHeight: 16 
        })
        this.load.spritesheet('item3', 'item3.png', { 
            frameWidth: 16, 
            frameHeight: 16 
        })
        this.load.image('item4', 'item4.png');
        this.load.image('item5', 'item5.png');
        // planet
        this.load.image('logo', 'logo.png');
        this.load.spritesheet('earthPlanet', 'earthPlanet.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('nodePlanet', 'nodePlanet.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('blackHole', 'blackHole.png', { frameWidth: 256, frameHeight: 256 });

        
        this.load.image('dialog_box', 'Card X5.png');   
        

        Array.from({length: 50}, (_, i) => `egg${i + 1}`).forEach(eggKey => {
            const number = eggKey.replace('egg', '');
            this.load.image(eggKey, `generate/${number}.png`);
        });
    }


    create ()
    {    
        this.createAnimations();

        EventBus.emit('current-scene-ready', this);
        this.scene.start('MainMenu');
    }

    
    createAnimations() {

        this.anims.create({
            key: 'item1_anim',
            frames: this.anims.generateFrameNumbers('item1', { start: 0, end: -1 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'item2_anim',
            frames: this.anims.generateFrameNumbers('item2', { start: 0, end: -1 }),
            frameRate: 8,
            repeat: -1
        })
        
        this.anims.create({
            key: 'item3_anim',
            frames: this.anims.generateFrameNumbers('item3', { start: 0, end: -1 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: 'earthPlanet_anim',
            frames: this.anims.generateFrameNumbers('earthPlanet', { start: 0, end: -1 }),
            frameRate: 13,
            repeat: -1,
            yoyo: false,
            duration: 5000
        })

        this.anims.create({
            key: 'nodePlanet_anim',
            frames: this.anims.generateFrameNumbers('nodePlanet', { start: 0, end: -1 }),
            frameRate: 5,
            repeat: -1,
            yoyo: false,
            duration: 5000
        })

        this.anims.create({
            key: 'blackHole_anim',
            frames: this.anims.generateFrameNumbers('blackHole', { start: 0, end: -1 }),
            frameRate: 13,
            repeat: -1,
            yoyo: false,
            duration: 5000
        })

        

    }

    
}
