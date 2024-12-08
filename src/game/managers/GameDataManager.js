import { EventBus } from '../EventBus';
import { ofContract } from '../../utils/blockchain';

export class GameDataManager {
    static instance = null;

    static getInstance() {
        if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
        }
        return GameDataManager.instance;
    }

    constructor() {
        if (GameDataManager.instance) {
            return GameDataManager.instance;
        }
        this.isInitialized = false;
        this.isConnected = false;
        this.playerInfo = {
            userId: null,
            nickName: null,
            userAddress: null,
            delegateAddress: null,
            nftId: null,
            conenctType: null
        }
        GameDataManager.instance = this;
    }

    setConnect(){

    }

    /**
     * @dev
     * 유저 존재 여부 확인
     * @param {string} userId 
     * @returns {boolean}
     */
    async _checkIsUser(userId) {
        return await ofContract.methods.get_isUser(userId).call()            
    }


    setPlayerInfo(userId, type){
        
    }
    
    getPlayerInfo() {
        return this.playerInfo;
    }
    // setWalletAddress(address) {
    //     this.walletAddress = address;
    //     EventBus.emit('wallet-connected', address);
    // }

    // async fetchPlayerData() {
    //     /**
    //      * @dev
    //      * 1. nickName
    //      * 2. nftId
    //      * 
    //      */
    //     try {
    //         // API 호출
    //         const response = await fetch(`/api/player/${this.walletAddress}`);
    //         const data = await response.json();
    //         this.playerData = data;
    //         this.isInitialized = true;
    //         EventBus.emit('player-data-updated', data);
    //         return data;
    //     } catch (error) {
    //         console.error('Failed to fetch player data:', error);
    //         throw error;
    //     }
    // }

    // getPlayerData() {
    //     return this.playerData;
    // }

    getWalletAddress() {
        return this.walletAddress;
    }

    setLineProfile(profile) {
        this.lineProfile = profile;
        EventBus.emit('line-profile-updated', profile);
    }

    getLineProfile() {
        return this.lineProfile;
    }

    isLineLoggedIn() {
        return !!this.lineProfile;
    }
}

// 싱글톤 �스턴스 export
export const gameData = GameDataManager.getInstance(); 