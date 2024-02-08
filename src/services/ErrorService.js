import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const execute = ({ error, errorMessage: receivedErrorMessage }) => {
  // eslint-disable-next-line no-console
  console.log(error);

  if (error?.response?.status === 413 || error?.response?.status === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Houve um problema',
      footer: 'Tente novamente mais tarde'
    });

    return;
  }

  let errorMessage = receivedErrorMessage || '';

  if (!errorMessage) {
    try {
      errorMessage = error.response.data.message;
    } catch (p) {
      errorMessage = 'Houve um problema ao processar a requisição';
    }
  }

  toast.error(errorMessage, {
    position: 'top-right'
  });


  if (errorMessage === 'Token inválido') {
    localStorage.clear();

    window.location.href = '/';
  }
};

export default execute;
