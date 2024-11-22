import PreLoad from './scenes/PreLoad';
import MainMenu from './scenes/MainMenu';
import Register from './scenes/Register';
import Phaser from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: true,
    },
    backgroundColor: '#000000',
    scene: [
        PreLoad,
        MainMenu,
        Register
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;

