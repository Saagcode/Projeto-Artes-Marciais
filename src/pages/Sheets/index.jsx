import Container from '../../components/container'
import Footer from '../../components/Footer'
import logo_selvagem from '../../../public/logoSelvagem.png'
import logout from '../../../public/logout.png'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import { isToday } from 'date-fns'
import '@fortawesome/fontawesome-free/css/all.css';
import Api from '../../services/Api';
import { FormatDate, FormatCurrency, TranslateStatus } from '../../services/UtilityServices';
import { FadeLoader } from 'react-spinners';
import ErrorService from '../../services/ErrorService';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import CurrencyInput from 'react-currency-input-field';
import { mask, unMask } from 'remask';
import { jwtDecode } from 'jwt-decode';
import Aos from 'aos'
import 'aos/dist/aos.css'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Sheets() {
    const [search, setSearch] = useState('');

    Aos.init();

    let compliment = '';
    const timesNow = new Date();
    let hourNow = timesNow.getHours();
    if (hourNow >= 6 && hourNow < 12) {
        compliment = 'Bom dia';
    } else if (hourNow >= 12 && hourNow < 18) {
        compliment = 'Boa tarde';
    } else {
        compliment = 'Boa noite';
    }


    if (hourNow > 12 && compliment === 'Boa tarde' && hourNow < 24) {
        compliment = 'Boa tarde';
        hourNow = hourNow - 12;
    }


    const userEmail = localStorage.getItem('userEmail');
    let nameUser = ''
    if (userEmail === 'academia.selvagemjjt@gmail.com') {
        nameUser = 'Luciano'
    } else {
        nameUser = 'Jhones'
    }

    // const [userMail, setUserMail] = useState('');
    // useEffect(() => {
    //     const token = localStorage.getItem('sessionKey')
    //     const decodedToken = (jwtDecode(token));
    //     if (decodedToken && typeof decodedToken === 'object' && decodedToken.hasOwnProperty('name')) {
    //         setUserMail(decodedToken.name)
    //     }
    // }, []);

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

    const [onlyPendingLearners, setOnlyPendingLearners] = useState(false)

    const beltColors = [
        'white',
        'gray',
        'yellow',
        'orange',
        'green',
        'blue',
        'purple',
        'brown',
        'black'
    ];

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentDate, setPaymentDate] = useState();
    const [priceMonthlyFees, setPriceMonthlyFees] = useState('');
    const [degree, setDegree] = useState('');
    const [senseiId, setSenseiId] = useState('');
    const [isFirstInvoicePaid, setIsFirstInvoicePaid] = useState('');
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const [senseis, setSenseis] = useState([]);

    useEffect(() => {
        const today = new Date();
        setPaymentDate(today.toISOString().split('T')[0]);
    }, []);

    const handleSubmit = () => {
        if (!name || !phone || !paymentDate || !priceMonthlyFees || !selectRadio || (!degree && degree !== 0) || !senseiId || !isFirstInvoicePaid) {
            return toast.error('Informe todos os parâmetros')
        } else {
            setModalOpen(false);
        }

        // :00:00.000Z
        // 2024-02-05T03

        const timezoneFixedDate = new Date(paymentDate.slice(0, 11) + 'T' + '03' + ':00:00.000Z');

        const requestBody = {
            name: name,
            phone: unMask(phone),
            paymentDate: timezoneFixedDate,
            beltColor: selectRadio,
            degree: +degree,
            isFirstInvoicePaid: isFirstInvoicePaid === 'true',
            subscriptionPrice: +priceMonthlyFees,
            senseiId: +senseiId
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

            clearModaldata();
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

        Api.get('clients/1/senseis', {
            headers: {
                authorization: `Bearer ${authorizationKey}`
            }
        }).then(({ data }) => {
            setSenseis(data)
        }).catch(error => {
            ErrorService({ error });
        })
    }, [])


    /* select pagamento pendente */
    const [newInvoiceStatus, setNewInvoiceStatus] = useState(null)

    const optChangePay = (event) => {
        const NewSelect = (event.target.value)
        setNewInvoiceStatus(NewSelect);
    }
    /* select pagamento pendente */

    /* radio das faturas */
    const [selectRadioFatura, setSelectRadioFatura] = useState(null)

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

    const [editingModalId, setEditingModalId] = useState();
    const [editingModalName, setEditingModalName] = useState('');
    const [editingModalPhone, setEditingModalPhone] = useState();
    const [editingModalPaymentDate, setEditingModalPaymentDate] = useState();
    const [editingModalPriceMonthlyFees, setEditingModalPriceMonthlyFees] = useState('');
    const [editingModalBeltColor, setEditingModalBeltColor] = useState('');
    const [editingModalDegree, setEditingModalDegree] = useState('');
    const [editingModalSenseiId, setEditingModalSenseiId] = useState('');

    const handleOpenEditingModal = editingLearner => {
        setEditingModalId(editingLearner.id)
        setEditingModalName(editingLearner.name)
        setEditingModalPhone(mask(unMask(editingLearner.phone), ['(99) 9999-9999', '(99) 99999-9999']))
        setEditingModalPaymentDate(new Date(editingLearner.expiringDate))
        setEditingModalPriceMonthlyFees(editingLearner.subscriptionPrice)
        setEditingModalBeltColor(editingLearner.beltColor)
        setEditingModalDegree(editingLearner.degree)
        setEditingModalSenseiId(editingLearner.senseiId)
    }

    const handleCloseEditingModal = () => {
        setEditingModalId(false)
    }

    const handleUpdateLearner = () => {
        if (
            !editingModalId ||
            !editingModalName ||
            !editingModalPhone ||
            !editingModalPaymentDate ||
            !editingModalPriceMonthlyFees ||
            !editingModalBeltColor ||
            (!editingModalDegree && editingModalDegree !== 0) ||
            !editingModalSenseiId
        )
            return toast.error('Preencha todas as informações')


        setOpenModalLoading(true);

        setTimeout(() => {
            const timezoneFixedDate = typeof editingModalPaymentDate === 'string' ? new Date(editingModalPaymentDate.slice(0, 11) + 'T' + '03' + ':00:00.000Z') : editingModalPaymentDate;

            const requestBody = {
                name: editingModalName,
                phone: editingModalPhone,
                beltColor: editingModalBeltColor,
                degree: +editingModalDegree,
                subscriptionPrice: +editingModalPriceMonthlyFees,
                expiringDate: timezoneFixedDate,
                senseiId: +editingModalSenseiId
            }

            Api.put(`clients/1/learners/${editingModalId}/update`, requestBody, {
                headers: {
                    authorization: `Bearer ${authorizationKey}`
                }
            }).then(({ data: newLearner }) => {
                handleCloseEditingModal(true);
                getLearners();
                toast.success('Atualizado com sucesso!')

            }).catch(error => {
                toast.error('Houve um problema, tente novamente mais tarde')
            }).finally(() => {
                setOpenModalLoading(false);
            });
        }, 1000)
    }

    const openModal = () => {
        setModalOpen(true);
    };

    const clearModaldata = () => {
        setName('');
        setPhone('');
        setDegree('');
        setSelectRadio(null);
        setPriceMonthlyFees('');
        setSenseiId('');
        setIsFirstInvoicePaid('');
    }

    const closeModal = () => {
        if (name || phone || selectRadio || degree || senseiId || isFirstInvoicePaid || priceMonthlyFees) {
            if (window.confirm('Tem certeza que deseja sair sem salvar?')) {
                clearModaldata();
                setModalOpen(false);
            }
        }
        setModalOpen(false);
    };

    const [newInvoiceObservation, setNewInvoiceObservation] = useState(null);
    const [price, setPrice] = useState(null);
    const [datedue, setDatedue] = useState(null);
    const [openModalLoading, setOpenModalLoading] = useState(false);

    useEffect(() => {
        const today = new Date();
        setDatedue(today.toISOString().split('T')[0]);
    }, []);

    const handleCreateInvoice = () => {
        if (!price || !datedue || !newInvoiceStatus) {
            e.preventDefault();
            return toast.error('Preencha todos os dados solicitados!')
        } else {
            setSelectRadioFatura(true)
        }

        if (!selectedLearner) {
            setTimeout(() => {
                window.location.reload()
            }, 1500)

            return toast.error('Houve um erro tente novamente mais tarde')
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
            title: 'Tem certeza que deseja marcar essa mensalidade como paga?',
            text: 'Essa ação é irreversível!',
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            showCancelButton: true
        }).then(result => {
            if (!result.value || !result.isConfirmed)
                return toast.info('Nada foi alterado');

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

    const renderSituation = lastPaymentDate => {
        const date = new Date(lastPaymentDate);

        const now = new Date();

        if (isToday(date))
            return <span style={{ color: '#F9A826' }}>Vence hoje</span>

        if (date > now)
            return <span style={{ color: '#00B0FF' }}>Regular</span>

        if (date < now)
            return <span style={{ color: '#e02041' }}>ATRASADO</span>
    }

    const [selectSensei, setSelectSensei] = useState('');

    const renderSensei = (senseiId) => {
        const matchingSensei = senseis.find(iterationSensei => iterationSensei.id === senseiId)

        return matchingSensei?.name || '- -';
    }

    // const calculoDeRaizQuadrada = (x) => {
    //     let y = x;

    //     return y;
    // }

    // const test = () => {
    //     const testArray = [
    //         1,
    //         2,
    //         3,
    //         4,
    //     ]

    //     const arrayDasRaizesQuadradas = testArray.map(iteration => {
    //         return calculoDeRaizQuadrada(iteration);
    //     })

    //     testArray.map(iteration => (
    //         <td>{iteration}</td>
    //     ))

    //     testArray.forEach(iteration => {
    //         const multiplication = iteration * 2;

    //         console.log(multiplication)
    //     })

    //     const filteredArray = testArray.filter(iteration => {
    //         const isEven = iteration % 2 === 0;

    //         return isEven
    //     })

    //     // console.log(filteredArray);
    // };

    // useEffect(() => {
    //     test();
    // }, [])

    const [post, setPost] = useState({});
    const [isLoad, setIsLoad] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            const post = { body: <div></div> }
            setPost(post);
            setIsLoad(false);
        }, 1500)
    }, []);
    return (
        <>

            <label htmlFor="btn_add">

                {modalOpenFatura && (
                    <div className='backdrop_modal_close'>
                        <dialog id='dialog' open >
                            <input type="button" value="X" id='dialog_btn' onClick={closeModalFatura} />
                            <form id='data' >
                                <fieldset className='containerField'>
                                    {selectRadioFatura === 'sim' ? (
                                        <fieldset className='containerField'>
                                            <legend>
                                                <span id='title_data'>Registrar Mensalidade</span>
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
                                                </p>
                                            </div>
                                            <div id='buttons_save_back'>
                                                <button id='btn_edit_learner' onClick={(e) => {
                                                    e.preventDefault();

                                                    handleCreateInvoice()
                                                }}>
                                                    <span>Salvar</span>
                                                </button>
                                                <input type="button" value="Voltar" className='btn_show_bill' onClick={() => setSelectRadioFatura('nao')} />
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
                                            </div>
                                        </fieldset>
                                    ) : (
                                        <div className='backdrop_modal_close'>
                                            <dialog id='dialog' open className='dialog_new-learner' >
                                                <form id='data' >
                                                    <fieldset className='containerField'>
                                                        <legend>
                                                            <input type="button" value="X" id='dialog_btn' onClick={closeModalFatura} />
                                                            <span id='title_data_text'>Mensalidades Registradas: <br /><br />
                                                                {/* <input type="button" value="Adicionar Mensalidade" className='btn_add_bills' onClick={() => setSelectRadioFatura('sim')} /><br /> */}

                                                                <div id='container_name'>
                                                                    <span id='learner_id'>
                                                                        {selectedLearner ?
                                                                            `${selectedLearner.id} | Aluno: ${selectedLearner.name}` : ''}
                                                                    </span>
                                                                </div>
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
                                                            <div style={{ overflow: 'scroll' }}>
                                                                <Table striped bordered hover size="sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className='table__tittle'>ID</th>
                                                                            <th className='table__tittle'>Valor</th>
                                                                            <th className='table__tittle'>Data de vencimento</th>
                                                                            <th className='table__tittle'>Status</th>
                                                                            {/* <th className='table__tittle'>Mensalidade extra?</th> */}
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
                                                                                {/* <td>{iterationInvoice.isExtraInvoice ? 'Sim' : 'Não'}</td> */}
                                                                                <td>{iterationInvoice.observation}</td>
                                                                                <td>
                                                                                    {iterationInvoice.status === 'pending' && (
                                                                                        <button
                                                                                            type="button"
                                                                                            style={{ scale: '0.8' }}
                                                                                            className='button_dell_edit'
                                                                                            onClick={() => handleMarkAsPaid(iterationInvoice.id, iterationInvoice.isExtraInvoice)}
                                                                                        >
                                                                                            <span className='fa-regular fa-pen-to-square'></span>
                                                                                        </button>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            </div>
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
            </label >
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
                                        <input type="text" className='boxInput' placeholder='Nome completo' style={{ width: '99%' }} value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div id='phone_mail'>
                                        <div className='line' style={{ width: '100%' }}>
                                            <p>Telefone</p>
                                            <input
                                                type="text"
                                                className='boxInput'
                                                placeholder='(     ) ___ ____________-____________ '
                                                value={phone}
                                                onChange={(e) => setPhone(mask(unMask(e.target.value), ['(99) 9999-9999', '(99) 99999-9999']))}
                                            />
                                        </div>
                                    </div>

                                    <div id='phone_mail'>
                                        <div id='container___phone-mail'>
                                            <div className='line'>
                                                <p>Valor</p>
                                                <CurrencyInput
                                                    id="input-example"
                                                    className='currency-input boxInput'
                                                    groupSeparator='.'
                                                    decimalSeparator=','
                                                    defaultValue={priceMonthlyFees}
                                                    name="input-name"
                                                    prefix='R$ '
                                                    placeholder='R$ '
                                                    decimalsLimit={2}
                                                    onValueChange={(value, name, values) => { setPriceMonthlyFees(values.float) }}
                                                />
                                                {/* <CurrencyInput
                                                    
                                                    prefix='R$ '
                                                    groupSeparator='-'
                                                    decimalSeparator=','
                                                    thousandSeparator='.'
                                                    value={priceMonthlyFees}
                                                    onChangeEvent={(
                                                    e,
                                                    maskedValue,
                                                    floatValue
                                                    ) => setPriceMonthlyFees(floatValue)}
                                                /> */}
                                            </div>
                                            <div className='line'><p>Data do pagamento</p><input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} type="date" className='boxInput' /></div>
                                        </div>
                                    </div>
                                    <div className='container_btn_new-learner'>
                                        <button type='button' id='btn_edit_learner' className='button_new-learner' onClick={() => handleSubmit()}>
                                            <span class="fa-solid fa-plus"></span>
                                        </button>
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
                                                    <div id={itBeltColor} className='selection-color color' onClick={() => setSelectRadio(itBeltColor)}></div>
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                        <div className='inline'><p>Grau</p>
                                            <select name="ndegree" id="idegree" value={degree} onChange={e => setDegree(e.target.value)} >
                                                <option value="Selecione" selected>Selecione</option>
                                                <option value="0">0</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </select>
                                            <div className='inline'>
                                                <p>Sensei</p>
                                                <select className='sensei' value={senseiId} onChange={e => setSenseiId(e.target.value)} >
                                                    <option value="Selecione" selected>Selecione</option>
                                                    {senseis.map(itSensei => (
                                                        <option value={itSensei.id}>{itSensei.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='inline'>
                                                <p style={{ fontSize: '8pt' }}>Pagamento efetuado?</p>
                                                <select id="paymentdone" value={isFirstInvoicePaid} onChange={e => setIsFirstInvoicePaid(e.target.value)}>
                                                    <option value=''>Selecione</option>
                                                    <option value="true">Sim</option>
                                                    <option value="false">Nao</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </dialog>
                    </div>
                )}
                {editingModalId && (

                    <div className='backdrop_modal_close'>
                        <dialog id='dialog' open className='dialog_new-learner'>
                            <input type="button" value="X" id='dialog_btn' onClick={handleCloseEditingModal} />
                            <form id='data' style={{ width: '85%' }}>
                                <fieldset className='containerField'>
                                    <legend>
                                        <span id='title_data'>Dados pessoais do aluno</span>
                                    </legend>
                                    <div>
                                        <p>Nome</p>
                                        <input type="text" className='boxInput' placeholder='Nome completo' style={{ width: '99%' }} value={editingModalName} onChange={e => setEditingModalName(e.target.value)} />
                                    </div>
                                    <div id='phone_mail'>
                                        <div className='line' style={{ width: '100%' }}>
                                            <p>Telefone</p>
                                            <input
                                                type="text"
                                                className='boxInput'
                                                placeholder='(     ) ___ ____________-____________ '
                                                value={editingModalPhone}
                                                onChange={(e) => setEditingModalPhone(mask(unMask(e.target.value), ['(99) 9999-9999', '(99) 99999-9999']))}
                                            />
                                        </div>
                                    </div>

                                    <div id='phone_mail'>
                                        <div id='container___phone-mail'>
                                            <div className='line'>
                                                <p>Valor</p>
                                                <CurrencyInput
                                                    id="input-example"
                                                    className='currency-input boxInput'
                                                    groupSeparator='.'
                                                    decimalSeparator=','
                                                    defaultValue={editingModalPriceMonthlyFees}
                                                    name="input-name"
                                                    prefix='R$ '
                                                    placeholder='R$ '
                                                    decimalsLimit={2}
                                                    onValueChange={(value, name, values) => { setEditingModalPriceMonthlyFees(values.float) }}
                                                />
                                            </div>
                                            <div className='line'>
                                                <p>Data do pagamento</p>
                                                <input
                                                    value={editingModalPaymentDate ? typeof editingModalPaymentDate === 'string' ? editingModalPaymentDate : editingModalPaymentDate.toISOString().split('T')[0] : ''}
                                                    onChange={e => setEditingModalPaymentDate(e.target.value)}
                                                    type="date"
                                                    className='boxInput'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button type='button' id='btn_edit_learner' className='button_new-learner' onClick={() => handleUpdateLearner()}>
                                        <span class="fa-solid fa-plus"></span>
                                    </button>
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
                                </fieldset>
                                <fieldset className='containerField'>
                                    <div id='container_beltdegree'><div className='inline'><p>Faixa</p>
                                        <div id='colors'>
                                            {beltColors.map(itBeltColor => (
                                                <>
                                                    <label htmlFor={itBeltColor}>
                                                        <input type="radio" className='Radio' value={itBeltColor} checked={editingModalBeltColor === itBeltColor} onClick={() => setEditingModalBeltColor(itBeltColor)} />
                                                    </label>
                                                    <div id={itBeltColor} className='selection-color color' onClick={() => setEditingModalBeltColor(itBeltColor)}></div>
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                        <div className='inline'><p>Grau</p>
                                            <select name="ndegree" id="idegree" value={editingModalDegree} onChange={e => setEditingModalDegree(e.target.value)} >
                                                <option value="0">0</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </select>
                                            <div className='inline'>
                                                <p>Sensei</p>
                                                <select className='sensei' value={editingModalSenseiId} onChange={e => setEditingModalSenseiId(e.target.value)} >
                                                    <option value="Selecione" selected>Selecione</option>
                                                    {senseis.map(itSensei => (
                                                        <option value={itSensei.id}>{itSensei.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </dialog>
                    </div>
                )}
                <div>
                    <div className='container-logout_newlearner' data-aos="fade-left" data-aos-duration="3000" data-aos-offset="50">
                        <div className='container-tittle'>
                            <span className='tittle'>{compliment}, {nameUser}!</span>
                        </div>
                        <input type="button" value="+Novo Aluno" id='btn_edit_learner-1' onClick={openModal} />
                        <label htmlFor="btn_exit">
                            <button id='btn_exit' onClick={() => handleLogout()}>
                                <img src={logout} alt="btn_exit" className='button_power' />
                                <span id='link_exit'>SAIR</span>
                            </button>
                        </label>
                    </div>
                    {isLoad ? (
                        <div style={{ margin: '-130px 0 0 0' }}>
                            <Skeleton count={1} style={{ margin: '8px 0 0 0' }} width={'1500px'} height={'50px'} baseColor='rgb(224, 224, 224)' />
                            <Skeleton count={1} style={{ margin: '8px 0 10px 0' }} width={'1500px'} height={'70px'} baseColor='rgb(224, 224, 224)' />
                            <Skeleton count={11} style={{ padding: '15px' }} width={'1500px'} height={'20px'} baseColor='rgb(224, 224, 224)' />
                            <Skeleton count={1} style={{ padding: '15px', borderRadius: '0 0 10px 10px' }} width={'1500px'} height={'20px'} baseColor='rgb(224, 224, 224)' />
                        </div>
                    ) : (
                        <>
                            {post.body || <Skeleton />}
                            <div className='template'>
                                <div className='section-container_sensei-learners'>
                                    <div className='search-bar_container'>
                                        <span className='fa-solid fa-magnifying-glass' />
                                        <input type="text" value={search} className='search' onChange={(e) => setSearch(e.target.value)} placeholder='Buscar Aluno' />
                                    </div>
                                    < div className='btn_container'>
                                        <div id='container_senseis'>
                                            <span>Sensei: </span><br />
                                            <select onChange={(e) => setSelectSensei(e.target.value)}>
                                                <option>Selecione</option>
                                                {senseis.map(itSensei => (
                                                    <option value={itSensei.id}>{itSensei.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div id='container_pendinglearners'>
                                            <span className='text-pendentpay'> Pagamentos pendentes:</span><br />
                                            <select onChange={() => setOnlyPendingLearners(!onlyPendingLearners)}>
                                                <option>Selecione</option>
                                                <option value={onlyPendingLearners}>Mostrar</option>
                                            </select>

                                        </div>
                                    </div>
                                </div>
                                <caption>Alunos Cadastrados<img src={logo_selvagem} alt="logotype" id='logo_2' /></caption>
                                <div className='scroll-table'>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th className='table__tittle'>Id</th>
                                                <th className='table__tittle'>Nome</th>
                                                <th className='table__tittle'>Telefone</th>
                                                <th className='table__tittle'>Faixa</th>
                                                <th className='table__tittle'>Grau</th>
                                                <th className='table__tittle'>Sensei</th>
                                                <th className='table__tittle'>Mensalidade</th>
                                                <th className='table__tittle'>Ultimo Pagamento</th>
                                                <th className='table__tittle'>Proximos Vencimentos</th>
                                                <th className='table__tittle'>Situação</th>
                                                <th className='table__tittle'></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {learners
                                                .filter(iterationLearner => {
                                                    if (search) {
                                                        const normalizedSearch = normalize(search);
                                                        const normalizedName = normalize(iterationLearner.name);

                                                        if (!normalizedName.includes(normalizedSearch))
                                                            return false;
                                                    }

                                                    if (!onlyPendingLearners && !selectSensei)
                                                        return true;

                                                    if (onlyPendingLearners) {
                                                        const learnerExpiringDate = new Date(iterationLearner.expiringDate);

                                                        const now = new Date();

                                                        const isPending = isToday(learnerExpiringDate) || learnerExpiringDate < now;

                                                        if (!isPending)
                                                            return false;
                                                    }

                                                    if (selectSensei) {
                                                        const isLearnerFromSelectedSensei = iterationLearner.senseiId === +selectSensei;

                                                        if (!isLearnerFromSelectedSensei)
                                                            return false;
                                                    }

                                                    return true;
                                                })
                                                .map(iterationLearner => (
                                                    <tr key={iterationLearner.id}>
                                                        <td>{iterationLearner.id}</td>
                                                        <td>{iterationLearner.name}</td>
                                                        <td>{mask(iterationLearner.phone, ['(99) 9999-9999', '(99) 99999-9999'])}</td>
                                                        <td style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <div
                                                                id={iterationLearner.beltColor}
                                                                className='selection-color'
                                                                style={{
                                                                    width: '60%',
                                                                }}
                                                            />
                                                        </td>
                                                        <td>{iterationLearner.degree}</td>
                                                        <td>{renderSensei(iterationLearner.senseiId)}</td>
                                                        <td>{FormatCurrency(iterationLearner.subscriptionPrice)}</td>
                                                        <td>{FormatDate({ date: iterationLearner.renewalDate })}</td>
                                                        <td>{FormatDate({ date: iterationLearner.expiringDate })}</td>
                                                        <td>{renderSituation(iterationLearner.expiringDate)}</td>
                                                        <td>
                                                            <button className='button_dell_edit' onClick={() => openModalFatura(iterationLearner)}><label htmlFor="button_dell_edit"><span className='fa-regular fa-money-bill-1' style={{ color: 'white', position: 'relative', top: '1px' }}></span></label></button>
                                                            <button className='button_dell_edit' onClick={() => handleOpenEditingModal(iterationLearner)}><label htmlFor="button_dell_edit"><span className='fa-regular fa-pen-to-square' style={{ position: 'relative', left: '2px', top: '0px', color: 'white' }}></span></label></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <Footer />
            </ Container >
        </>
    )
}

export default Sheets 
