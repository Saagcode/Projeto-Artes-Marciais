export const FormatDate = ({ date, detailed }) => {
  const functionDate = typeof date === 'string' ? new Date(date) : date

  const dateFormat = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }

  if (detailed) {
    dateFormat.hour = '2-digit';
    dateFormat.minute = '2-digit';
  }

  const result = Intl.DateTimeFormat('pt-BR', detailed).format(functionDate);

  return result;
}

export const FormatCurrency = value => {
  const functionValue = typeof value === 'string' ? +value : value

  const result = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(functionValue);

  return result;
}

export const TranslateStatus = ({ dueDate, status }) => {
  const now = new Date();

  if (status === 'pending' && now > dueDate)
    return 'Atrasado';

  switch (status) {
    case 'paid':
      return 'Pago';
    case 'pending':
      return 'Pendente';
  }
}

// const updateLearnerNameInList = (list, changingLearnerId, newName = 'josé') => {
// // [{id: 1, name: 'joao', cpf, rg, telefone, bla bla bla}, {id: 2, name: 'pedro'}]

//   list = list.map(
//     itLearner => itLearner.id === changingLearnerId ?
//       {
//         ...itLearner,
//         name: newName
//       }
//     :
//       itLearner
//   )
// }
