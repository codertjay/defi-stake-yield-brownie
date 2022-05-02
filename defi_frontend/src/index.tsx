import {getDefaultProvider} from 'ethers'
import {DAppProvider, Kovan, Mainnet, useEtherBalance, useEthers} from '@usedapp/core'
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css'

const config = {
    readOnlyChainId: Mainnet.chainId,
    notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
    },
    readOnlyUrls: {
        // [Mainnet.chainId]: 'https://mainnet.infura.io/v3/221b904604be42689d6c697d1654c2fa',
        [Kovan.chainId]: 'https://kovan.infura.io/v3/221b904604be42689d6c697d1654c2fa',
    },
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <DAppProvider config={config}>
        <App/>
    </DAppProvider>
)
reportWebVitals();
