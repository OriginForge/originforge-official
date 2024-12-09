import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { gameData } from '../game/managers/GameDataManager';
import { EventBus } from '../game/EventBus';
import { useLiff } from 'react-liff';
export const ConnectBtn = ({ onConnect }) => {
    const isConnected = gameData.isConnected;
    const [userData, setUserData] = useState(gameData._getPlayerInfo());
    const { error, isLoggedIn, isReady, liff } = useLiff();

    // console.log(onConnect);
    useEffect(()=> {        
        EventBus.on('user-info-updated', (info) => {
            setUserData(info);
        });
    },[gameData])
    
    useEffect(()=> {
        initCheck();
    },[])


    const initCheck = async () => {
        const profile = await liff.getProfile();
        console.log(profile);
    
    }
    const typeColor = {
        kaia: '#BFF009',
        line: '#06C755',
        telegram: '#24A1DE'
    }

    const viewProfile = () => {
        EventBus.emit('show-profile');
    }
    return (
        <div className="flex justify-center items-center">
            {!isConnected ? (
                <button 
                    className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 
                     border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
                    onClick={onConnect}
                >
                    <Wallet size={16} color="#9CA3AF" />
                    Connect
                </button>
            ) : (
                <button 
                    onClick={viewProfile}
                    className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 
                             border hover:border-gray-500 text-gray-300 hover:text-white"
                    style={{borderColor: typeColor[userData.connectType]}}
                >
                    {/* <Wallet size={16} color={typeColor[userData.connectType]} /> */}
                    {/* userData.nftImage를 이미지로 표시 해당 값은 base64 형식 */}
                    <img src={userData.nftImage} alt="NFT" className="w-5 h-5" />
                    {userData.nickName}
                    {console.log(userData)}
                </button>
            )}
        </div>
    )
}