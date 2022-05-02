import {useEffect, useState} from "react"
import {useContractFunction, useEthers} from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import Erc20 from "../chain-info/contracts/ERC20.json"
import {utils, constants} from "ethers"
import {Contract} from "@ethersproject/contracts"
import networkMapping from "../chain-info/contracts/map.json"


export const unstackTokens = () => {
    const {chainId} = useEthers()
    const {abi} = TokenFarm

}
