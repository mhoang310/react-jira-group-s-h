
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Login from '../../components/Login/Login';
import Register from '../../components/Register/Register';

import { getUserInfo } from '../../redux/selectors';

function Auth() {
    const [auth, setAuth] = useState(true);

    let location = useLocation();
    let from = location.state?.from?.pathname || '/';

    const { accessToken } = useSelector(getUserInfo);

    const handleOnClick = useCallback(
        (e) => {
            setAuth(!auth);
        },
        [auth]
    );
    if (accessToken) {
        return <Navigate to={from} replace />;
    }

    return (
        <div className="auth">
            <div className="auth__left">
                <div className="auth__left-container" id="auth__left-container">
                    <h2>Bug & Task Management </h2>
                    <p>
                        Author: Tran Minh Sang & Pham Minh Hoang (CyberSoft)
                    </p>
                    <div
                        className="auth__left__image"
                        // src="https://wiki.tino.org/wp-content/uploads/2021/07/word-image-1272.png"
                        style={{height: "300px",backgroundImage: "url(https://picsum.photos/2000)", backgroundSize: "100%"}}                        
                        alt="jira-background"
                    />
                </div>
                {/* Animation Background */}
                <div className="area">
                    <ul className="circles">
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
            </div>
            <div className="auth__right">
                {auth ? (
                    <Login onClick={handleOnClick} />
                ) : (
                    <Register onClick={handleOnClick} />
                )}
            </div>
        </div>
    );
}

export default Auth;
