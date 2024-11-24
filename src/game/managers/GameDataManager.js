import { EventBus } from '../EventBus';

class GameDataManager {
    constructor() {
        this.playerData = null;
        this.walletAddress = null;
        this.isInitialized = false;
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
}

export const gameData = new GameDataManager(); 