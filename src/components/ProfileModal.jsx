import { X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { gameData } from '../game/managers/GameDataManager';
import { EventBus } from '../game/EventBus';

const ProfileModal = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userInfo, setUserInfo] = useState(gameData._getPlayerInfo());

    useEffect(() => {
        const handleShowProfile = () => {
            setShowProfileModal(true);
        };

        const handleUserInfoUpdate = (info) => {
            setUserInfo(info);
        };

        EventBus.on('show-profile', handleShowProfile);
        EventBus.on('user-info-updated', handleUserInfoUpdate);
        
        return () => {
            EventBus.off('show-profile', handleShowProfile);
            EventBus.off('user-info-updated', handleUserInfoUpdate);
        };
    }, []);

    const handleDisconnect = async () => {
        try {
            await gameData.disconnect();
            setShowProfileModal(false);
            setUserInfo(null);
            EventBus.emit('user-info-updated', null);
        } catch (error) {
            console.error('연결 해제 중 오류 발생:', error);
        }
    };

    if (!showProfileModal) return null;

    const typeColor = {
        kaia: '#BFF009',
        line: '#06C755', 
        telegram: '#24A1DE'
    };

    const typeIcon = {
        kaia: '/assets/connector/Kaia/btn_base.png',
        line: '/assets/connector/line/btn_base.png',
        telegram: '/assets/connector/telegram/btn_base.png'
    };

    const handleOpenSea = () => {
        window.open(`https://opensea.io/assets/klaytn/0xf4bfff05f9444d394d084d9516a35c54a7b50222/${userInfo.nftId}`, '_blank');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
                onClick={() => setShowProfileModal(false)}
            />
            <div className="relative bg-[#03191B]/95 border-2 border-[#01C9A2]/30 rounded-xl w-[400px] p-8 shadow-[0_0_15px_rgba(1,201,162,0.3)] animate-slideIn">
                <button
                    onClick={() => setShowProfileModal(false)}
                    className="absolute right-4 top-4 text-[#01C9A2] hover:text-white p-1.5 
                               hover:bg-[#01C9A2]/20 rounded-lg transition-all duration-300
                               hover:shadow-[0_0_10px_rgba(1,201,162,0.3)] hover:rotate-90"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center gap-4">
                    <div className="relative cursor-pointer group" onClick={handleOpenSea}>
                        <img 
                            src={userInfo.nftImage} 
                            alt="NFT" 
                            className="w-32 h-32 rounded-lg border-2 group-hover:opacity-90 transition-opacity" 
                            style={{borderColor: typeColor[userInfo.connectType]}} 
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-pixelify text-white">
                            #{userInfo.nftId}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white text-sm font-pixelify">OpenSea에서 보기</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <img 
                            src={typeIcon[userInfo.connectType]} 
                            alt={userInfo.connectType}
                            className="w-5 h-5"
                        />
                        <h2 className="font-pixelify text-2xl text-white">{userInfo.nickName}</h2>
                    </div>
                    <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between text-gray-300 font-pixelify group relative">
                            <span>Wallet:</span>
                            <span 
                                className="text-sm cursor-pointer hover:text-[#01C9A2] transition-colors duration-300"
                                onClick={() => {
                                    navigator.clipboard.writeText(userInfo.userAddress);
                                    const tooltip = document.getElementById('copy-tooltip');
                                    tooltip.classList.remove('opacity-0');
                                    tooltip.classList.add('opacity-100');
                                    setTimeout(() => {
                                        tooltip.classList.remove('opacity-100');
                                        tooltip.classList.add('opacity-0');
                                    }, 2000);
                                }}
                                title="클릭하여 복사하기"
                            >
                                {userInfo.userAddress?.slice(0,6)}...{userInfo.userAddress?.slice(-4)}
                                <div 
                                    id="copy-tooltip"
                                    className="absolute -top-8 right-0 px-2 py-1 bg-[#01C9A2] text-black text-xs rounded 
                                             shadow-lg opacity-0 transition-opacity duration-300 font-pixelify"
                                >
                                    복사되었습니다!
                                </div>
                            </span>
                        </div>
                        
                        <div className="flex justify-between text-gray-300 font-pixelify">
                            <span>Point:</span>
                            <span>{userInfo.point || 0}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDisconnect}
                        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 
                                 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300
                                 border border-red-500/30 hover:border-red-500/50 font-pixelify"
                    >
                        <LogOut size={18} />
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
