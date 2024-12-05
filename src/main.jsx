import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, createStorage, cookieStorage } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defineChain } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { injected } from 'wagmi/connectors';
import {injectExampleEIP6963} from './utils/injectEIP6963';
import * as dotenv from 'dotenv';

dotenv.config();

injectExampleEIP6963();

const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );


const queryClient = new QueryClient();

const projectId = "5afb111b65801e2b7b4e5afbdc07fc2c";
// const projectId = import.meta.env.VITE_APPKIT_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_APPKIT_PROJECT_ID is not defined in environment variables');
}

const metadata = {
  name: 'Origin-Forge',
  description: 'web3 fully onchain game project on kaia network ',
  url: 'https://reown.com/appkit',
  icons: ['https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/b52422f5-0c95-45d1-b5ae-70cd98d5bd00/sm']
};

export const customNetwork = defineChain({
  id: 8217,
  caipNetworkId: 'eip155:8217',
  chainNamespace: 'eip155', 
  name: 'kaia',
  nativeCurrency: {
    decimals: 18,
    name: 'kaia',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      https: ['https://public-en.node.kaia.io'],
      webSocket: ['wss://public-en.node.kaia.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Kaia Scan', url: 'https://kaiascan.io/' },
  },
});

const networks = [customNetwork];

const generalConfig = {
  projectId,
  metadata,
  networks
};

const connectors = [];
  
if (typeof window !== "undefined" && window.klaytn && !isMobile) {
    connectors.push(injected({
        target: ({
            id: 'kaiaWallet',
            name: 'Kaia Wallet',
            provider:  "07ba87ed-43aa-4adf-4540-9e6a2b9cae00" ,
            icon: 'data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwIgogICAgICBoZWlnaHQ9IjEwMCIKICAgICAgdmlld0JveD0iMCAwIDEwMCAxMDAiCiAgICAgIGZpbGw9Im5vbmUiCiAgICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgID4KICAgICAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNCRkYwMDkiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgZmlsbFJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgY2xpcFJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgZD0iTTMzLjI3NDUgMzNMNDQuMjU1MyA2Ny4yNTE1TDQ1LjMxNyA2My45NDNMMzUuMzk3IDMzSDM5LjA3MzVMNDcuMTU2IDU4LjIxMDFMNDguMjE1MSA1NC45MDE1TDQxLjE5NiAzM0g0NC44NzI1TDUwLjA1NDEgNDkuMTY2TDU1LjIzOTEgMzNIODJMNjkuMTc0OCA3M0g0Mi40MTRMNDIuNDE4OCA3Mi45ODcxTDI5LjU5OCAzM0gzMy4yNzQ1Wk0yNy40NzU1IDMzTDQwLjMwMDcgNzNIMzYuNjI0MkwyMy43OTkgMzNIMjcuNDc1NVpNMjEuNjc2NSAzM0wzNC41MDE3IDczSDMwLjgyNTJMMTggMzNIMjEuNjc2NVoiCiAgICAgICAgZmlsbD0iYmxhY2siCiAgICAgIC8+CiAgICA8L3N2Zz4='
        })
    }))
    
}
connectors.push(injected())

const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),  
    connectors,
    ssr: true,
    projectId,
    networks
})

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  featuredWalletIds: [
    "3c2c985c0adff6f46a0d0e466b3924ed8a059043882cd1944ad7f2adf697ed54"
  ],
  
  features: {
      swaps: false,
      onramp: false,
      history: false,
      
  },
  allWallets: 'HIDE',
  chainImages: {
    8217: 'data:image/png;base64,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Uk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAJcEhZcwAACxMAAAsTAQCanBgAAAXMaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA5LjEtYzAwMiA3OS5hNmE2Mzk2LCAyMDI0LzAzLzEyLTA3OjQ4OjIzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjUuMTIgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0xMC0yOVQxMToyMzoxMiswOTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU3M2IxNTkzLTdlMjctNzY0MC04YzZjLTA0NWNkN2I1MjRjYiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmE2ZWJmYmYxLTRmZGQtYTc0YS04MDg5LTE3M2MzYTM5NzgwNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjUwNzI3YjIzLTljYmYtYzI0ZS04ZmM3LThkOGQ5ZDMzODBjYiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTA3MjdiMjMtOWNiZi1jMjRlLThmYzctOGQ4ZDlkMzM4MGNiIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTI5VDExOjIzOjEyKzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMTIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NzNiMTU5My03ZTI3LTc2NDAtOGM2Yy0wNDVjZDdiNTI0Y2IiIHN0RXZ0OndoZW49IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4xMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Qg1byAAAApFJREFUSIm9lb9rU1EUxz/nvbykSZMmGWLTNvUHInQriJMojkpxEQuCDoL4Y1F0dnFwqIuTCv0DpIMoHbpIKRSEoosQ2kEstS2a0tIfNk1S86Pv3evw0lQwL4m09Yzvnnc+53vOPffIZDY4BnQBWxy8RYFlH3ABiBwCYNfyxiEGr9l/gfhadXQUdIThiCWYwA6QyWkqCkw5AIitoDcubGxpht84rGcgEoOL1w064lAu7hOiNKTiwtdZzc1zO2TXtPujH85ftkh2GpSLen+QtiAU0Ty5ZVcBbm2CbWAYgqYxAFpofDwgpD9q0lMKgEfPTWa0n3dzFj0nwa766QashkqUcrNIxKSqQBOJuZNbTkB23fWxAiANmu+pRGvw+90pnZvbTVMYuufQ11VhILXDpe4KDwdstIZQg3H2ViLQ0y68eOnw7IFd+2zbsL5SdUDYWKlm26DwnpBkVPj0WdUAVkC4ctug54QQCArvRxzSUwqfT2rK/xkSAiZGVU3W09cm9wd9bKJJIWwsaNJTjnfkZhDDhDLwfRZA03/a4NqgybSjKOaBGFTU3nVuZvUrqd0Dy++qWP0J2zYkTCEagzDC0kJL8b0hSoEF9J91M11eVDy+a5NHE0EYemUzMdpaqQBkMhvMUWeftHeAU4QbZ3aY/+J2NdHlNj0zv9erZK8wMu0jHIXtXF2G9z7JZSEeEobHLVKnXEVry5rMvKKz1+B4nwAKpdwEGg2j5+0yDfixqTmaEsZmLN6OKL6lNeEYXL1jUtzSfBhXdB8TRKD0yxviWa5dcxS0hyAZcPeIAKu2xtDQaQkFDUs5jdJg1FeTb/oKmwaUSrBY+nvasn+8wB4A96wZ5CDsv+34Am5PCocQPwwUfgP5s+FSXZGn+wAAAABJRU5ErkJggg=='
  },
  debug: true,
  defaultNetwork: customNetwork,
  
  ...generalConfig,
});




  ReactDOM.createRoot(document.getElementById('root')).render(    
    <React.StrictMode>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
         <App isMobile={isMobile}/>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  )



