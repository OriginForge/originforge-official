import { EventBus } from '../EventBus';

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
        this.playerData = null;
        this.walletAddress = null;
        this.isInitialized = false;
        this.lineProfile = null;
        GameDataManager.instance = this;
    }

    setWalletAddress(address) {
        this.walletAddress = address;
        EventBus.emit('wallet-connected', address);
    }

    async fetchPlayerData() {
        /**
         * @dev
         * 1. nickName
         * 2. nftId
         * 
         */
        try {
            // API 호출
            const response = await fetch(`/api/player/${this.walletAddress}`);
            const data = await response.json();
            this.playerData = data;
            this.isInitialized = true;
            EventBus.emit('player-data-updated', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch player data:', error);
            throw error;
        }
    }

    getPlayerData() {
        return this.playerData;
    }

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