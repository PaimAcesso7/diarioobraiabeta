import React from 'react';

interface AppLogoProps {
    className?: string;
    logoSrc?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, logoSrc }) => {
    // This component will only render an image if a logoSrc is provided.
    // Otherwise, it will render nothing, making the logo entirely dependent
    // on the admin settings.
    if (!logoSrc) {
        return null;
    }

    return (
        <img src={logoSrc} alt="Logo da Plataforma" className={className} />
    );
};
