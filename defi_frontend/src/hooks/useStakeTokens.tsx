import {useEffect, useState} from "react"
import {useContractFunction, useEthers} from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import Erc20 from "../chain-info/contracts/ERC20.json"
import {utils, constants} from "ethers"
import {Contract} from "@ethersproject/contracts"
import networkMapping from "../chain-info/contracts/map.json"

/**
 * This hook is a bit messy but exposes a 'send' which makes two transactions.
 * The first transaction is to approve the ERC-20 token transfer on the token's contract.
 * Upon successful approval, a second transaction is initiated to execute the transfer by the TokenFarm contract.
 * The 'state' returned by this hook is the state of the first transaction until that has status "Succeeded".
 * After that it is the state of the second transaction.
 * @param tokenAddress - The token address of the token we wish to stake
 */
export const useStakeTokens = (tokenAddress: string) => {
    const {chainId} = useEthers()
    const {abi} = TokenFarm
    const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero

    const tokenFarmInterface = new utils.Interface(abi)

    const tokenFarmContract = new Contract(
        tokenFarmContractAddress,
        tokenFarmInterface
    )

    const {send: stakeTokensSend, state: stakeTokensState} =
        useContractFunction(tokenFarmContract, "stakeTokens", {
            transactionName: "Stake tokens",
        })

    const erc20Interface = new utils.Interface(Erc20.abi)

    const tokenContract = new Contract(tokenAddress, erc20Interface)

    const {send: approveErc20Send, state: approveAndStakeErc20State} =
        useContractFunction(tokenContract, "approve", {
            transactionName: "Approve ERC20 transfer",
        })

    const [amountToStake, setAmountToStake] = useState("0")

    useEffect(() => {
        console.log(approveAndStakeErc20State.status)
        if (approveAndStakeErc20State.status === "Success") {
            console.log('working', amountToStake, tokenAddress)
            stakeTokensSend(amountToStake, tokenAddress)
        }
        // the dependency array
        // the code inside the useEffect anytime
        // anything in this list changes
        // if you want something to run when the component first runs
        // you just have a blank list
    }, [approveAndStakeErc20State, amountToStake, tokenAddress]) // eslint-disable-line react-hooks/exhaustive-deps

    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveErc20Send(tokenFarmContractAddress, amount)
    }


    const [state, setState] = useState(approveAndStakeErc20State)

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            setState(stakeTokensState)
        } else {
            setState(approveAndStakeErc20State)
        }
    }, [approveAndStakeErc20State, stakeTokensState])

    return {approveAndStake, state}
}