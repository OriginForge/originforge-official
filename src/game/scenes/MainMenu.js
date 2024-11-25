import { Scene } from 'phaser';
import { EventBus } from '../EventBus';


export default class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // 배경 설정
        const background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setScale(this.cameras.main.width / background.width, this.cameras.main.height / background.height);

        // 씬 준비 완료 이벤트
        EventBus.emit('current-scene-ready', this);    

        // RegisterBox 씬을 현재 씬 위에 오픈
        this.add.text(100, 100, 'RegisterBox', { fontSize: '32px', fill: '#FFF' })
    }


    openRegisterBox() {
        this.scene.launch('RegisterBox');
    }
}
