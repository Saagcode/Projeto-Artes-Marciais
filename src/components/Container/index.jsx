import StylesContainer from '../Container/styles';

function Container({ children }) { /* props que indica elemento filho de componente */
    return (
        <StylesContainer>
            {children}
        </StylesContainer>
    )
}

export default Container;