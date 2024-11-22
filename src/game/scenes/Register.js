import { Scene } from 'phaser';

export default class CustomCharacter extends Scene
{
    constructor ()
    {
        super('Register');
    }

    create(){
        // this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Register', { fontSsize: '32px', color: '#ffffff' }).setOrigin(0.5);
        
        const inputNickname = this.add.text(0,0, "Nickname", { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        this.add.container(this.cameras.main.centerX, this.cameras.main.centerY, [
            // registerBox 
            this.add.rectangle(0,0, 500, 500, 0xffffff, 0.5),
            inputNickname
        ]);

    }


    createRegisterBox(){
        
    }


}
