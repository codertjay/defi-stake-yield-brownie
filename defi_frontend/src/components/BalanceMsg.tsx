import React from 'react';
import './BalanceMsg.css'

interface BalanceMsgProps {
    label: string
    amount: number
    tokenImgSrc: string
}

function BalanceMsg({amount, tokenImgSrc, label}: BalanceMsgProps) {
    return (
        <div className={'container'}>
            <div className="label">{label}</div>
            <div className="amount">{amount}</div>
            <img src={tokenImgSrc} alt="" className={'tokenImg'}/>
        </div>
    );
}

export default BalanceMsg;