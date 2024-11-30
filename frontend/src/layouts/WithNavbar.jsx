import React from 'react';

function WithNavbar({ children }) {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
}

export default WithNavbar;
