import { HashRouter, Route, Routes } from 'react-router-dom';
import Login from '../src/pages/Login';
import Sheets from '../src/pages/Sheets';
import { ToastContainer } from 'react-toastify'

function AppRoutes() {
    return (
        
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path='/tabelas' element={<Sheets />} />
                </Routes>
            </HashRouter>
        
    )
}

export default AppRoutes