import React from 'react';
import './App.css';
import Header from "./components/Header";
import {Container} from "@mui/material";
import { Main } from './components/Main';

function App() {
    return (
        <>
            <Header/>
            <Container maxWidth={'md'}>
                <Main/>
            </Container>
        </>
    );
}

export default App;
