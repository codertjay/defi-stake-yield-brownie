import React, {useState} from 'react';
import {Token} from '../Main'
import {Box, Tab} from "@mui/material";
import {TabContext, TabList, TabPanel} from '@mui/lab';
import {WalletBalance} from "./WalletBalance";
import StakeForm from "./StakeForm";

interface YourWalletProps {
    supportedTokens: Array<Token>
}

function YourWallet({supportedTokens}: YourWalletProps) {
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }
    return (
        <Box>
            <h1>Your Wallet!</h1>

            <Box>
                <TabContext value={selectedTokenIndex.toString()}>
                    <TabList onChange={handleChange} arria-label={"stake from tabs"}>
                        {supportedTokens.map((token, index) => {
                            return (
                                <Tab label={token.name}
                                     value={index.toString()}
                                     key={index}
                                />
                            )
                        })}
                    </TabList>

                    {supportedTokens.map((token, index) => {
                        return (
                            <TabPanel value={index.toString()} key={index}>

                                <div>
                                    <WalletBalance token={supportedTokens[selectedTokenIndex]}/>
                                    <StakeForm
                                        token={supportedTokens[selectedTokenIndex]}

                                    />
                                </div>
                            </TabPanel>
                        )
                    })}

                </TabContext>
            </Box>
        </Box>
    );
}

export default YourWallet;