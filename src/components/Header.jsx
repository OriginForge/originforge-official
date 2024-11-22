import { useAppKitAccount } from '@reown/appkit/react';

export default function Header() {
    const { address, caipAddress, isConnected, status  } = useAppKitAccount();
 return(    
    <header className="main-header">
        <div className="header-left">
            <h1 className="header-title">Origin-Forge</h1>
        </div>
        <div className="header-right">
            {
                isConnected ? (
                    <appkit-account-button size="sm" balance="show" loadingLabel='connecting'/>
                ) : (
                    <appkit-connect-button size="sm" label='Connect Wallet' loadingLabel='connecting'/>
                )                
            }
        </div>
    </header>
 )   
}