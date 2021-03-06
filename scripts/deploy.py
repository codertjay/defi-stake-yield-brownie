import json
import os
import shutil

from web3 import Web3

from scripts.helpful_scripts import get_account, get_contract
from brownie import DappToken, TokenFarm, config, network
import yaml

KEPT_BALANCE = Web3.toWei(100, 'ether')


def deploy_token_farm_and_dapp_token(frontend_update=False):
    account = get_account()
    print(network.show_active())
    dapp_token = DappToken.deploy({'from': account})
    token_farm = TokenFarm.deploy(
        dapp_token.address,
        {'from': account},
        publish_source=config[
            'networks'][network.show_active()]['verify'])
    tx = dapp_token.transfer(
        token_farm.address,
        dapp_token.totalSupply() - KEPT_BALANCE,
        {'from': account})
    tx.wait(1)
    # dapp_token, weth_token, faucet_token/dai
    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")
    dict_of_allowed_tokens = {
        dapp_token: get_contract("dai_usd_price_feed"),
        fau_token: get_contract("dai_usd_price_feed"),
        weth_token: get_contract("eth_usd_price_feed"),
    }
    add_allowed_tokens(token_farm, dict_of_allowed_tokens, account)
    if frontend_update:
        update_frontend()
    return token_farm, dapp_token


def add_allowed_tokens(token_farm, dict_of_allowed_tokens, account):
    for token in dict_of_allowed_tokens:
        add_tx = token_farm.addAllowedTokens(token.address, {'from': account})
        add_tx.wait(1)
        print('TOKEN ADDRESS', token.address, dict_of_allowed_tokens[token], dict_of_allowed_tokens)
        set_tx = token_farm.setPriceFeedContract(
            token.address,
            dict_of_allowed_tokens[token])
        print("Set Price Feed Contract")
        set_tx.wait(1)

    return token_farm


def update_frontend():
    # send the build folder
    copy_folders_to_front_end("./build", './defi_frontend/src/chain-info')
    with open('brownie-config.yaml', 'r') as brownie_config:
        config_dict = yaml.load(
            brownie_config
            , Loader=yaml.FullLoader)
        with open('./defi_frontend/src/brownie-config.json', 'w') as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
        print('Front end updated')


def copy_folders_to_front_end(src, destination):
    if os.path.exists(destination):
        shutil.rmtree(destination)
    shutil.copytree(src, destination)


def main():
    deploy_token_farm_and_dapp_token(frontend_update=True)
