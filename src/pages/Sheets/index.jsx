import Container from '../../components/container'
import Footer from '../../components/Footer'
import logo_selvagem from '../../../public/logoSelvagem.png'
import logout from '../../../public/logout.png'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import { startOfDay, addDays } from 'date-fns'
import '@fortawesome/fontawesome-free/css/all.css';
import Api from '../../services/Api';
import { FormatDate, FormatCurrency, TranslateStatus } from '../../services/UtilityServices';
import { FadeLoader } from 'react-spinners';
import ErrorService from '../../services/ErrorService';

import Swal from 'sweetalert2';

function Sheets() {
    const handleLogout = () => {
        localStorage.clear()
        navigate('/');
    }

    const navigate = useNavigate();
    const authorizationKey = localStorage.getItem('sessionKey');
    if (!authorizationKey)
        navigate('/');

    const [learners, setLearners] = useState([]);
    const [selectedLearner, setSelectedLearner] = useState();
    const [invoices, setInvoices] = useState([]);

    const handleRemove = (learnerId) => {
        setLearners(prevLearners => prevLearners.filter(iterationLearner => iterationLearner.id !== learnerId));
    };

    const beltColors = [
        'white',
        'blue',
        'purple',
        'brown',
        'black'
    ];

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentDate, setPaymentDate] = useState();
    const [degree, setDegree] = useState('');
    const [isFirstInvoicePaid, setIsFirstInvoicePaid] = useState('');

    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const handleSubmit = () => {
        if (!name || !phone || !paymentDate || !selectRadio || !degree || !isFirstInvoicePaid) {
            return window.alert('Informe todos os parâmetros')
        }

        // :00:00.000Z
        // 2024-02-05T03

        const timezoneFixedDate = new Date(paymentDate.slice(0, 11) + 'T' + '03' + ':00:00.000Z');

        const requestBody = {
            name: name,
            phone: phone,
            paymentDate: timezoneFixedDate,
            beltColor: selectRadio,
            degree: +degree,
            isFirstInvoicePaid: isFirstInvoicePaid === 'true',
            subscriptionPrice: 135
        }

        Api.post(`clients/1/learners`, requestBody, {
            headers: {
                authorization: `Bearer ${authorizationKey}`
            }
        }).then(({ data: newLearner }) => {
            const updatedLearnersArray = [
                newLearner,
                ...learners
            ]

            setLearners(updatedLearnersArray)
        }).catch(error => {
        })
    }

    const getLearners = () => {
        Api.get('clients/1/learners', {
            headers: {
                authorization: `Bearer ${authorizationKey}`
            }
        }).then(({ data }) => {
            setLearners(data)
        }).catch(error => {
            ErrorService({ error });
        })
    }

    useEffect(() => {
        getLearners();
    }, [])

    const today = new Date();
    const tomorrow = startOfDay(addDays(today, 0));

    const [userSelection, setSelection] = useState(null)
    const changedate = (event) => {
        const selection = new Date(event.target.value)
        setSelection(selection)
    }

    /* select pagamento pendente */
    const [newInvoiceStatus, setNewInvoiceStatus] = useState(null)

    const optChangePay = (event) => {
        const NewSelect = (event.target.value)
        setNewInvoiceStatus(NewSelect);
    }
    /* select pagamento pendente */

    /* radio das faturas */
    const [selectRadioFatura, setSelectRadioFatura] = useState(null)

    const optChangeFatura = (event) => {
        setSelectRadioFatura(event.target.value)
    }
    /* radio das faturas */

    /* radio das faixas */
    const [selectRadio, setSelectRadio] = useState(null)

    const optChange = (event) => {
        setSelectRadio(event.target.value)
    }
    /* radio das faixas */

    const [modalOpenFatura, setModalOpenFatura] = useState(false);

    const openModalFatura = settingLearner => {
        setModalOpenFatura(true);

        setLoadingInvoices(true);

        setSelectedLearner(settingLearner);

        Api.get(`clients/1/learners/${settingLearner.id}/invoices`, {
            headers: {
                authorization: `Bearer ${authorizationKey}`
            }
        }).then(({ data }) => {
            setInvoices(data);
            setLoadingInvoices(false)
        }).catch(error => {
            ErrorService({ error });
        })
    };

    const closeModalFatura = () => {
        setInvoices([]);
        setSelectedLearner();

        setModalOpenFatura(false);
    };

    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const [newInvoiceObservation, setNewInvoiceObservation] = useState(null);
    const [price, setPrice] = useState(null);
    const [datedue, setDatedue] = useState(null);
    const [openModalLoading, setOpenModalLoading] = useState(false);

    const handleCreateInvoice = () => {
        if (!price || !datedue || !newInvoiceStatus) {
            e.preventDefault();
            return window.alert('Preencha todos os dados solicitados!')
        }

        if (!selectedLearner) {
            setTimeout(() => {
                window.location.reload()
            }, 1500)
            
            return window.alert('Houve um erro tente novamente mais tarde')
        }

        if (openModalLoading)
            return;

        setOpenModalLoading(true);

        const timezoneFixedDate = new Date(datedue.slice(0, 11) + 'T' + '03' + ':00:00.000Z');

        const requestBody = {
            dueDate: timezoneFixedDate,
            observation: newInvoiceObservation,
            value: +price
        }

        Api.post(`clients/1/learners/${selectedLearner.id}/invoices`, requestBody, {
            headers: {
                authorization: `Bearer ${authorizationKey}`
            }
        }).then(({ data: newInvoice }) => {
            setInvoices([newInvoice, ...invoices]);

            setOpenModalLoading(false);
        }).catch(error => {
            ErrorService({ error });

            setOpenModalLoading(false);
        })
    }

    const handleMarkAsPaid = (invoiceId, isExtraInvoice) => {
        Swal.fire({
            title: 'Tem certeza que deseja marcar essa fatura como paga?',
            text: 'Essa ação é irreversível!',
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            showCancelButton: true
        }).then(result => {
            if (!result.value || !result.isConfirmed)
                return window.alert('Nada foi alterado');

            if (openModalLoading)
                return;
    
            setOpenModalLoading(true);
    
            // get - le
            // post - cria
            // put - atualiza varias coisas
            // patch - atualiza uma coisa especifica
            // delete - apaga uma coisa

            Api.patch(`clients/1/learners/${selectedLearner.id}/invoices/${invoiceId}`, {}, {
                headers: {
                    authorization: `Bearer ${authorizationKey}`
                }
            }).then(({ data: newInvoice }) => {
                setInvoices(invoices.map(itInvoice => itInvoice.id === invoiceId ? {
                    ...itInvoice,
                    status: 'paid'
                } : itInvoice))
    
                setSelectRadioFatura('nao')
    
                setOpenModalLoading(false);
    
                if (!isExtraInvoice) {
                    getLearners();
                }
            }).catch(error => {
                ErrorService({ error });
    
                setOpenModalLoading(false);
            })
        });
    }

    return (
        <>
            <div id='btn_container'>
                <label htmlFor="btn_exit">
                    <button id='btn_exit' onClick={() => handleLogout()}>
                        <img src={logout} alt="btn_exit" />
                        <span id='link_exit'>SAIR</span>
                    </button>
                </label>
                <label htmlFor="btn_add">

                    {modalOpenFatura && (
                        <div className='backdrop_modal_close'>
                            <dialog id='dialog' open >
                                <input type="button" value="X" id='dialog_btn' onClick={closeModalFatura} />
                                <form id='data' >
                                    <fieldset className='containerField'>
                                        {selectRadioFatura === 'sim' ? (
                                            <fieldset className='containerField'>

                                                <input type="button" value="Voltar" className='btn_show_bill' onClick={() => setSelectRadioFatura('nao')} />
                                                <legend>
                                                    <span id='title_data'>Registrar Fatura</span>
                                                </legend>


                                                <p>Valor</p><input type="number" className='boxInput' placeholder='R$' value={price} onChange={e => setPrice(e.target.value)} />

                                                <div className='line'>
                                                    <p>Observacao</p>
                                                    <input type="text" className='boxInput' value={newInvoiceObservation} onChange={e => setNewInvoiceObservation(e.target.value)} />
                                                </div>
                                                <div id='phone_mail' style={{ width: '100%' }}>
                                                    <div className='line'>
                                                        <p>Data de vencimento</p>
                                                        <input type="date" className='boxInput' value={datedue} onChange={e => setDatedue(e.target.value)} />
                                                    </div>
                                                    <p>Status
                                                        <select style={{ width: '100%', fontSize: '12pt', marginLeft: '5px', marginTop: '7px' }} value={newInvoiceStatus} onChange={optChangePay}>
                                                            <option value='Selecionar' selected disabled>Selecione</option>
                                                            <option value='pendente'>Pendente</option>
                                                            <option value='Pago'>Pago</option>
                                                        </select>
                                                        {newInvoiceStatus === 'pendente' ? (
                                                            <div style={{ transition: '0.6s', opacity: '1' }}>
                                                                <label htmlFor='check_paid' className='check_paid' >Marcar como pago</label>
                                                                <input type='checkbox' className='check_paid' />
                                                            </div>
                                                        ) :
                                                            <div style={{ transition: '0.6s', opacity: '0' }}>
                                                                <label htmlFor="check_paid" className='check_paid' >Marcar como pago</label>
                                                                <input type="checkbox" className='check_paid' />
                                                            </div>
                                                        }</p>
                                                </div>
                                                <button id='btn_edit_learner' onClick={(e) => {
                                                    e.preventDefault();

                                                    handleCreateInvoice()
                                                }}>
                                                    <span>Salvar</span>
                                                </button>
                                                {openModalLoading && (
                                                    <div className='backdrop'>
                                                        <dialog className='modalLoading'>
                                                            <div className='loader'>
                                                                <FadeLoader
                                                                    color='#ffbb00'
                                                                    size={100}
                                                                    loading={true}
                                                                />
                                                            </div>
                                                        </dialog>
                                                    </div>
                                                )}
                                            </fieldset>
                                        ) : (
                                            <div className='backdrop_modal_close'>
                                                <dialog id='dialog' open className='dialog_new-learner' >
                                                    <form id='data' >
                                                        <fieldset className='containerField'>
                                                            <legend>
                                                                <input type="button" value="X" id='dialog_btn' onClick={closeModalFatura} />
                                                                <span id='title_data'>Faturas Registradas: {selectedLearner ? `${selectedLearner.id} - ${selectedLearner.name}` : ''}
                                                                    <input type="button" value="Adicionar Fatura" className='btn_add_bills' onClick={() => setSelectRadioFatura('sim')} />
                                                                </span>
                                                            </legend>

                                                            {loadingInvoices ? (
                                                                    <div className='backdrop'>
                                                                        <dialog className='modalLoading'>
                                                                            <div className='loader'>
                                                                                <FadeLoader
                                                                                    color='#ffbb00'
                                                                                    size={100}
                                                                                    loading={true}
                                                                                />
                                                                            </div>
                                                                        </dialog>
                                                                    </div>
                                                            ) : (
                                                                <Table striped bordered hover size="sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className='table__tittle'>ID</th>
                                                                            <th className='table__tittle'>Valor</th>
                                                                            <th className='table__tittle'>Data de vencimento</th>
                                                                            <th className='table__tittle'>Status</th>
                                                                            <th className='table__tittle'>Fatura extra?</th>
                                                                            <th className='table__tittle'>Observação</th>
                                                                            <th></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {invoices.map(iterationInvoice => (
                                                                            <tr>
                                                                                <td className='back'>{iterationInvoice.id}</td>
                                                                                <td className='back'>{FormatCurrency(iterationInvoice.value)}</td>
                                                                                <td className='back'>{FormatDate({ date: iterationInvoice.dueDate })}</td>
                                                                                <td>{TranslateStatus({ dueDate: new Date(iterationInvoice.dueDate), status: iterationInvoice.status })}</td>
                                                                                <td>{iterationInvoice.isExtraInvoice ? 'Sim' : 'Não'}</td>
                                                                                <td>{iterationInvoice.observation}</td>
                                                                                <td>
                                                                                    {iterationInvoice.status === 'pending' && (
                                                                                        <button
                                                                                            type="button"
                                                                                            style={{ scale: '0.8' }}
                                                                                            className='button_dell_edit'
                                                                                            onClick={() => handleMarkAsPaid(iterationInvoice.id, iterationInvoice.isExtraInvoice)}
                                                                                        >
                                                                                            👍
                                                                                        </button>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            )}
                                                        </fieldset>
                                                    </form>
                                                </dialog>
                                            </div>
                                        )}
                                    </fieldset>
                                </form>
                            </dialog>
                        </div>
                    )}
                    <input style={{ padding: '10px' }} type="button" value="+ Novo Aluno" id='btn_edit_learner' className='btn_add' onClick={openModal} />
                </label >
            </div >
            <Container>
                {modalOpen && (
                    <div className='backdrop_modal_close'>
                        <dialog id='dialog' open className='dialog_new-learner'>
                            <input type="button" value="X" id='dialog_btn' onClick={closeModal} />
                            <form id='data' style={{ width: '85%' }}>
                                <fieldset className='containerField'>
                                    <legend>
                                        <span id='title_data'>Dados pessoais do aluno</span>
                                    </legend>
                                    <div>
                                        <p>Nome</p>
                                        <input type="text" className='boxInput' placeholder='Nome completo' style={{ width: '98%' }} value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div id='phone_mail'>
                                        <div className='line' style={{ width: '100%' }}><p>Telefone</p><input type="number" className='boxInput' placeholder='(     ) ___ ____________-____________ ' value={phone} onChange={e => setPhone(e.target.value)} /></div>
                                    </div>

                                    <div id='phone_mail'>
                                        <div id='container___phone-mail'>

                                            <div className='line'><p>Data do pagamento</p><input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} type="date" className='boxInput' /></div>
                                            <div className='line'>
                                                <p style={{ fontSize: '8pt' }}>Pagamento efetuado?</p>
                                                <select id="paymentdone" value={isFirstInvoicePaid} onChange={e => setIsFirstInvoicePaid(e.target.value)} style={{ width: '95%' }}>
                                                    <option value=''>Selecione</option>
                                                    <option value="true">Sim</option>
                                                    <option value="false">Nao</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>


                                </fieldset>
                                <fieldset className='containerField'>
                                    <div id='container_beltdegree'><div className='inline'><p>Faixa</p>
                                        <div id='colors'>
                                            {beltColors.map(itBeltColor => (
                                                <>
                                                    <label htmlFor={itBeltColor}>
                                                        <input type="radio" className='Radio' value={itBeltColor} checked={selectRadio === itBeltColor} onClick={() => setSelectRadio(itBeltColor)} />
                                                    </label>
                                                    <div id={itBeltColor} className='color' onClick={() => setSelectRadio(itBeltColor)}></div>
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                        <div className='inline'><p>Grau</p>
                                            <select name="ndegree" id="idegree" value={degree} onChange={e => setDegree(e.target.value)} >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type='button' id='btn_edit_learner' className='button_new-learner' onClick={() => handleSubmit()}>
                                        <span class="fa-solid fa-plus"></span>
                                    </button>
                                </fieldset>
                            </form>
                        </dialog>
                    </div>
                )}
                <div className='template'>
                    <caption>Alunos Cadastrados<img src={logo_selvagem} alt="logotype" id='logo_2' /></caption>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th className='table__tittle'>Nome</th>
                                <th className='table__tittle'>Telefone</th>
                                <th className='table__tittle'>Faixa</th>
                                <th className='table__tittle'>Grau</th>
                                <th className='table__tittle'>Ultimo Pagamento</th>
                                <th className='table__tittle'>Proximos Vencimentos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {learners.map(iterationLearner => (
                                <tr key={iterationLearner.id}>
                                    <td className='back'>{iterationLearner.name}</td>
                                    <td className='back'>{iterationLearner.phone}</td>
                                    <td id={iterationLearner.beltColor} style={{ scale: '0.4', borderRadius: '50px' }}></td>
                                    <td className='back'>{iterationLearner.degree}</td>
                                    <td>{FormatDate({ date: iterationLearner.renewalDate })}</td>
                                    <td>{FormatDate({ date: iterationLearner.expiringDate })}</td>
                                    <td> <button className='button_dell_edit' onClick={() => openModalFatura(iterationLearner)}><label htmlFor="button_dell_edit"><span className='fa-regular fa-money-bill-1' style={{ color: 'white', position: 'relative', top: '-2px' }}></span></label></button>
                                        <button className='button_dell_edit' onClick={openModal}><label htmlFor="button_dell_edit"><span className='fa-regular fa-pen-to-square' style={{ position: 'relative', left: '2px', top: '-2px', color: 'white' }} onClick={openModal}></span></label></button>
                                        <button className='button_dell_edit' onClick={() => handleRemove(iterationLearner.id)} ><label htmlFor="fa-regular fa-trash-can"><span className='fa-regular fa-trash-can' style={{ color: 'white', position: 'relative', top: '-1px' }} ></span></label></button> </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <Footer />
            </ Container>
        </>
    )
}

export default Sheets 