import { useState, useEffect } from 'react'
import { LineLogin } from './LineLogin'
import { TelegramLogin } from './TelegramLogin'
import { KaiaLogin } from './KaiaLogin'
import { X } from 'lucide-react'

export default function ConnectModal({ isOpen, onClose }) {
  const handleKaikasConnect = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('click', preventBackgroundClick, true)
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('click', preventBackgroundClick, true)
    }
  }, [isOpen])

  const preventBackgroundClick = (e) => {
    if (!e.target.closest('.modal-content')) {
      e.stopPropagation()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
        style={{pointerEvents: 'all'}}
      />
      
      <div 
        className="modal-content relative bg-[#03191B]/95
                   border-2 border-[#01C9A2]/30 rounded-xl w-[400px] p-8 shadow-[0_0_15px_rgba(1,201,162,0.3)]
                   transform transition-all duration-300 ease-out animate-slideIn"
        style={{pointerEvents: 'all', zIndex: 10000}}
      >
        {/* 상단 장식 테두리 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#01C9A2]/50 to-transparent animate-glow" />
        
        <div className="relative text-center mb-16">
          <h2 className="font-pixelify text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#01C9A2] to-teal-300 
                         tracking-wider absolute w-full left-0 right-0 animate-pulse">
            CONNECT WALLET
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-[#01C9A2] hover:text-white p-1.5 
                       hover:bg-[#01C9A2]/20 rounded-lg transition-all duration-300
                       hover:shadow-[0_0_10px_rgba(1,201,162,0.3)] hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col space-y-4 px-6 py-4">
          <div className="w-full animate-fadeInUp delay-100">
            <KaiaLogin />
          </div>
          <div className="w-full animate-fadeInUp delay-200">
            <LineLogin />
          </div>
          <div className="w-full animate-fadeInUp delay-300">
            <TelegramLogin />
          </div>
        </div>

        {/* 하단 장식 테두리 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#01C9A2]/50 to-transparent animate-glow" />
      </div>
    </div>
  )
}
