import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Container from '../../../src/components/container'
import logo_selvagem from '../../../public/logoSelvagem.png'
import Footer from '../../components/Footer'
import logoFight from '../../../public/logoFight.png'
import Api from '../../services/Api'
import { FadeLoader } from 'react-spinners';
import './login.module.css'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [openModalLoading, setOpenModalLoading] = useState(false);

    const handleLogin = () => {
        if (!email || !password) {
            return window.alert('Dados nao informados!')
        }
        setOpenModalLoading(true);

        const requestBody = {
            email: email,
            password: password
        }

        Api.post('sessions', requestBody)
            .then(response => {
                const authorizationKey = response.data.authorizationKey;
                localStorage.setItem('sessionKey', authorizationKey);

                navigate('/tabelas');
            })
            .catch(error => {
                setError('Email ou Senha incorretos. Verifique os dados e tente novamente');
                setTimeout(() => {
                    setError('');
                }, 2500);
                setOpenModalLoading(false);
                console.log(error);
            })
    }



    return (
        <>
            <Container>
                <div id='loginBoxes'>
                    <img src={logoFight} alt="martialArtsImg" id='martialArts' />
                    <div id='interface'>
                        <div id='logo_text'>
                            <img src={logo_selvagem} alt="logotype" id='logo' /> <h2>SELVAGEM JJT</h2>
                        </div>
                        <h1 className='titleBox'>Sign in
                            <p>Acesse a interface de usuario digitando e-mail e senha abaixo.</p>
                        </h1>
                        <label htmlFor="name"><b>E-mail:</b></label>
                        <input id="name" className='typeBox' value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder=' Digite o seu e-mail' maxLength={800} />
                        <label htmlFor="pass"><b>Senha:</b></label>
                        <input id='pass' className='typeBox' value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder=' Digite a sua senha' maxLength={12} />
                        <button type="button" value="CONFIRMAR" id='btn_confirm' onClick={() => handleLogin()}>Logar</button>
                    </div>
                </div>
                <Footer />
            </Container>
            {openModalLoading && (
                <div className='backdrop'>
                    <dialog className='modalLoading' open>
                        <div className='loader'>
                            <FadeLoader
                                color='#ffbb00'
                                size={300}
                                loading={true}
                            />
                        </div>
                    </dialog>
                </div>
            )}
            {error && (
                <div className='backdrop'>
                    <dialog className='modalLoading_error' open>
                        <div className='error'>{error}</div>
                    </dialog>
                </div>
            )}
        </>
    )
}

export default Login