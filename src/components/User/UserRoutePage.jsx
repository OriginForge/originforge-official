import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gameData } from '../../game/managers/GameDataManager';
import NotFound from '../NotFound';
import { motion } from 'framer-motion';
import { Gift, Navigation, ExternalLink, Share2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet-async';

export default function UserRoutePage() {
    const { nickname } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [showQRCode, setShowQRCode] = useState(false);
    const currentURL = window.location.href;

    useEffect(() => {
        checkIsUser();
    }, [nickname]);

    const checkIsUser = async () => {
        try {
            const res = await gameData._checkIsUser((nickname));
            if (res) {
                setIsUser(true);
                const info = await gameData.getPageUserInfo(nickname);
                setUserInfo(info);
            } else {
                setIsUser(false);
            }
        } catch (error) {
            console.error('사용자 확인 중 오류 발생:', error);
            setIsUser(false);
        } finally {
            setIsLoading(false);
        }
    }

    const handleVisit = () => {
        // 방문 로직 구현
        console.log('방문하기');
    }

    const handleGift = () => {
        // 선물하기 로직 구현
        console.log('선물하기');
    }

    const handleOpenSea = () => {
        if (userInfo && userInfo[0].userWallet) {
            window.open(`https://opensea.io/${userInfo[0].userWallet}`, '_blank');
        }
    }

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${userInfo[0].userNickName}의 프로필`,
                    url: currentURL
                });
            } else {
                await navigator.clipboard.writeText(currentURL);
                alert('링크가 클립보드에 복사되었습니다!');
            }
        } catch (error) {
            console.error('공유하기 실패:', error);
        }
    }

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-16 w-16 border-t-4 border-b-4 border-white"
                />
            </div>
        );
    }

    if (!isUser) {
        return <NotFound />;
    }

    return (
        <>
            {userInfo && (
                <Helmet>
                    <title>{`${userInfo[0].userNickName}의 프로필 | KAIA`}</title>
                    <meta name="description" content={`${userInfo[0].userNickName}님의 KAIA 프로필 페이지입니다.`} />
                    
                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="profile" />
                    <meta property="og:title" content={`${userInfo[0].userNickName}의 프로필 | KAIA`} />
                    <meta property="og:description" content={`${userInfo[0].userNickName}님의 KAIA 프로필 페이지입니다.`} />
                    <meta property="og:image" content={userInfo[1]} />
                    <meta property="og:url" content={currentURL} />
                    
                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={`${userInfo[0].userNickName}의 프로필 | KAIA`} />
                    <meta name="twitter:description" content={`${userInfo[0].userNickName}님의 KAIA 프로필 페이지입니다.`} />
                    <meta name="twitter:image" content={userInfo[1]} />
                </Helmet>
            )}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:py-12 sm:px-6 lg:px-8 overflow-x-hidden"
            >
                <div className="w-full max-w-4xl mx-auto">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8"
                    >
                        <motion.h1 
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            프로필
                        </motion.h1>
                        {userInfo && (
                            <div className="space-y-6 sm:space-y-8">
                                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                                    {userInfo[1] && (
                                        <motion.div 
                                            whileHover={{ scale: 1.1 }}
                                            className="relative flex-shrink-0"
                                        >
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-purple-500 shadow-lg">
                                                <img 
                                                    src={userInfo[1]} 
                                                    alt="프로필 이미지"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                    <div className="text-center md:text-left w-full">
                                        <motion.h2 
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
                                        >
                                            {userInfo[0].userNickName}
                                        </motion.h2>
                                        <motion.p 
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-gray-600 text-base sm:text-lg break-all"
                                        >
                                            ID: {userInfo[0].userId}
                                        </motion.p>
                                        
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleVisit}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                                            >
                                                <Navigation size={18} />
                                                방문하기
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleGift}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base"
                                            >
                                                <Gift size={18} />
                                                선물하기
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleOpenSea}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base"
                                            >
                                                <ExternalLink size={18} />
                                                OpenSea
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleShare}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                                            >
                                                <Share2 size={18} />
                                                공유하기
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={toggleQRCode}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                            >
                                                <QrCode size={18} />
                                                QR코드
                                            </motion.button>
                                        </div>
                                        {showQRCode && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                                onClick={toggleQRCode}
                                            >
                                                <motion.div 
                                                    className="bg-white p-6 rounded-lg"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <QRCodeSVG 
                                                        value={currentURL}
                                                        size={200}
                                                        level="H"
                                                        includeMargin={true}
                                                        bgColor="#FFFFFF"
                                                        fgColor="#000000"
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex border-b border-gray-200 mb-6">
                                    <button
                                        className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        프로필 정보
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium ${activeTab === 'nft' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                        onClick={() => setActiveTab('nft')}
                                    >
                                        NFT 정보
                                    </button>
                                </div>

                                {activeTab === 'profile' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                                            <span className="bg-blue-500 w-2 h-8 mr-3 rounded"></span>
                                            지갑 정보
                                        </h3>
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-gray-50 rounded-lg p-3 sm:p-4 transition-colors duration-200"
                                        >
                                            <p className="text-gray-700 break-all mb-2 text-sm sm:text-base">
                                                <span className="font-semibold">주소:</span> 
                                                <span className="break-words">{userInfo[0].userWallet}</span>
                                            </p>
                                            {userInfo[0].delegateAccount && (
                                                <p className="text-gray-700 break-all text-sm sm:text-base">
                                                    <span className="font-semibold">위임 주소:</span> 
                                                    <span className="break-words">{userInfo[0].delegateAccount}</span>
                                                </p>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}

                                {activeTab === 'nft' && userInfo[0].userSBTId && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-bold text-lg mb-3">NFT 상세 정보</h4>
                                                <p className="text-gray-700 mb-2">
                                                    <span className="font-semibold">NFT ID:</span> {userInfo[0].userSBTId}
                                                </p>
                                                <p className="text-gray-700 mb-2">
                                                    <span className="font-semibold">컬렉션:</span> KAIA SBT
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">토큰 표준:</span> ERC-721
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-bold text-lg mb-3">NFT 이미지</h4>
                                                {userInfo[1] && (
                                                    <img 
                                                        src={userInfo[1]} 
                                                        alt="NFT 이미지"
                                                        className="w-full h-auto rounded-lg"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}