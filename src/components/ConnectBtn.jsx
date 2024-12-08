import React, { useEffect, useState } from 'react';
import { GameDataManager } from '../game/managers/GameDataManager';
import { Menu, Home, Info, Gamepad2, Wallet } from 'lucide-react';
import { gameData } from '../game/managers/GameDataManager';
export const ConnectBtn = () => {
    const [isConnected, setIsConnected] = useState(false);
    
    const checkUser = async (userId) => {
        console.log(await gameData._checkIsUser("0x42087186aC1659Efe0F9b2f394ee93C8905422b4"));
    }

    return (
        <>
            {   
                !isConnected ? (
                    <button 
                        className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 
                         border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
                        onClick={()=>checkUser('123')}
                    >
                <Wallet size={16} color="#9CA3AF" />
                Connect
            </button>
        ) : (
            <button 
                className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 
                         border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
            >
                <Wallet size={16} color="#9CA3AF" />
                Connect
            </button>
        )}
    </>
    )
}