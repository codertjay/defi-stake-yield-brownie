import {useEtherBalance, useEthers} from "@usedapp/core";
import React from 'react';
import './Header.css'

const Header = () => {
    const {activateBrowserWallet, deactivate, account} = useEthers()
    const userBalance = useEtherBalance(account)
    return (
        <div className={'header_container'}>
            {!account && <button onClick={activateBrowserWallet}> Connect </button>}
            {account && <p>Account: {account}</p>}
            {account && <button onClick={deactivate}> Disconnect </button>}
        </div>
    );
};

export default Header;

