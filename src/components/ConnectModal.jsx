import { useState, useEffect } from 'react'
import { LineLogin } from './LineLogin'
import { TelegramLogin } from './TelegramLogin'
import { KaikasLogin } from './KaikasLogin'
import { X } from 'lucide-react'

export default function ConnectModal({ isOpen, onClose }) {
  const handleKaikasConnect = () => {
    // 카이카스 연결 로직 구현
    onClose()
  }

  // 모달이 열릴 때 배경 클릭 이벤트 방지
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

  // 배경 클릭 이벤트 방지 함수
  const preventBackgroundClick = (e) => {
    if (!e.target.closest('.modal-content')) {
      e.stopPropagation()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* 모달 뒷배경 - 클릭 방지를 위한 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        style={{pointerEvents: 'all'}}
      />
      
      <div 
        className="modal-content bg-indigo-950/90 border border-indigo-800 rounded-lg w-[480px] p-8 shadow-lg relative"
        style={{pointerEvents: 'all', zIndex: 10000}}
      >
        <div className="relative text-center mb-12">
          <h2 className="font-pixelify text-xl text-white absolute w-full left-0 right-0">Connectors</h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-gray-400 hover:text-white p-1 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-4 px-4 mt-12">
          <KaikasLogin />
          <TelegramLogin />
          <LineLogin />
        </div>
      </div>
    </div>
  )
}
