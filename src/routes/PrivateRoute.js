import {useContext, useState} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
    // const { user } = useContext(AuthContext);
    const [user, setUser] = useState({ email: '123' });

    return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;