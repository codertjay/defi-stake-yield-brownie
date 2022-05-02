import React, {useEffect, useState} from 'react';
import {Token} from "../Main";
import {useEthers, useTokenBalance, useNotifications} from "@usedapp/core";
import {formatUnits} from "@ethersproject/units";
import {Button, CircularProgress, Input} from "@mui/material";
import {useStakeTokens} from "../../hooks/useStakeTokens";
import {utils} from 'ethers'
import {Snackbar,} from "@mui/material";
import {Alert} from "@mui/material";
import './StakeForm.css'
export interface StakeFromProps {
    token: Token
}

function StakeForm({token}: StakeFromProps) {
    const {address: tokenAddress, name} = token
    const {account} = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance
        ? parseFloat(formatUnits(tokenBalance, 18)) : 0

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0);
    const {notifications} = useNotifications()

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" :
            Number(event.target.value)
        setAmount(newAmount)
    }
    const {approveAndStake, state: approveAndStakeErc20State} = useStakeTokens(tokenAddress)

    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }

    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false);
    const [showStakeTokenSuccess, setShowStakeTokenSuccess] = useState(false);
    const isMining = approveAndStakeErc20State.status === "Mining"

    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setShowStakeTokenSuccess(false)
    }
    useEffect(() => {
            if (
                notifications.filter(
                    (notification) =>
                        notification.type === "transactionSucceed" &&
                        notification.transactionName === "Approve ERC20 transfer"
                ).length > 0
            ) {
                setShowErc20ApprovalSuccess(true)
                setShowStakeTokenSuccess(false)

            }
            if (notifications.filter(
                (notification) => notification.type === "transactionSucceed" &&
                    notification.transactionName === 'Stake tokens'
            ).length > 0) {
                setShowErc20ApprovalSuccess(false)
                setShowStakeTokenSuccess(true)
            }
        }
        , [notifications,
            showErc20ApprovalSuccess,
            showStakeTokenSuccess]);


    return (
        <div className={'stakeform'}>
            <div className=""><Input onChange={handleInputChange}/>
                <Button onClick={handleStakeSubmit}
                        color={'primary'} size={'large'}
                        disabled={isMining}
                >{isMining ? <CircularProgress size={26}/>
                    : "Stake!!"}</Button>
            </div>
            <Snackbar open={showErc20ApprovalSuccess} autoHideDuration={5000}
                      onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved! Now approve the 2nd transaction
                </Alert>

            </Snackbar>
            <Snackbar open={showStakeTokenSuccess} autoHideDuration={5000}
                      onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    Token Staked!
                </Alert>
            </Snackbar>

        </div>
    );
}

export default StakeForm;