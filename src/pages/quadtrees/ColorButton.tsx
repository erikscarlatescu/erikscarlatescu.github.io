import React, { CSSProperties } from 'react';

import './colorbuttonstyles.css';

interface Props {
    buttonColor: CSSProperties;
}

export const ColorButton: React.FC<Props> = ({buttonColor}) => {
    return (
        <button className="colorButton" style={buttonColor} />
    )
}

export default ColorButton;