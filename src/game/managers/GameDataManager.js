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
            nftImage: null,
            connectType: null
        }

        // 저장된 데이터가 있으면 불러오기
        const cachedData = localStorage.getItem('gamePlayerInfo');
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            this.playerInfo = parsedData.playerInfo;
            this.isConnected = parsedData.isConnected;
        }

        GameDataManager.instance = this;
    }

    setConnect(){
        this.isConnected = true;
        this._saveToCache();
    }

    disconnect() {
        this.isConnected = false;
        this.playerInfo = {
            userId: null,
            nickName: null,
            userAddress: null,
            delegateAddress: null,
            nftId: null,
            nftImage: null,
            connectType: null,
            
        };
        localStorage.removeItem('gamePlayerInfo');
        EventBus.emit('user-disconnected');
    }

    _saveToCache() {
        const dataToSave = {
            playerInfo: this.playerInfo,
            isConnected: this.isConnected
        };
        localStorage.setItem('gamePlayerInfo', JSON.stringify(dataToSave));
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
        if(type === 'kaia'){
            this.playerInfo.userId = userId;
            this.playerInfo.userAddress = userId;
            this.playerInfo.connectType = 'kaia';
            this._saveToCache();
        }
    }
    
    async getPlayerInfo(userId,type) {
        const info = await ofContract.methods.get_User(String(userId).toLocaleLowerCase()).call();
        
        this.playerInfo = {
            userId: info[0].userId,
            nickName: info[0].userNickName,
            userAddress: info[0].userWallet,
            delegateAddress: info[0].delegateAccount,
            nftId: info[0].userSBTId,
            nftImage: info[1],
            connectType: type
        }
        this.isConnected = true;
        this._saveToCache();
        EventBus.emit('user-info-updated', this.playerInfo);
    }

    async getPageUserInfo(userId) {
        const info = await ofContract.methods.get_User(String(userId).toLocaleLowerCase()).call();
        return info;
    }

    _getPlayerInfo() {
        return this.playerInfo;
    }

    isConnected() {
        return this.isConnected;
    }

    getWalletAddress() {
        return this.playerInfo.userAddress;
    }

    setLineProfile(profile) {
        this.lineProfile = profile;
        EventBus.emit('line-profile-updated', profile);
        this._saveToCache();
    }

    getLineProfile() {
        return this.lineProfile;
    }

    isLineLoggedIn() {
        return !!this.lineProfile;
    }
}

export const gameData = GameDataManager.getInstance();