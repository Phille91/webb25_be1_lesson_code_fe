/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react"
import {getMe, login} from "../api/auth"
import { LS_ACCESS_TOKEN_KEY } from "../api/client"
const defaultState = {
    user: null,
    accessToken: null,
    actions: {
        login: (loginData = { email: "", password: ""}) => new Promise(),
        logout: () => {}
    }
}

const AuthContext = createContext(defaultState)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(defaultState.user)
    const [accessToken, setAccessToken] = useState(defaultState.accessToken)

    console.log(user, accessToken)

    useEffect(() => {
        const _accessToken = localStorage.getItem(LS_ACCESS_TOKEN_KEY)
        if(_accessToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAccessToken(_accessToken)
        }
    },[])

    useEffect(() => {
        if(accessToken) {
            // eslint-disable-next-line react-hooks/immutability
            _getMe()
        }
    },[accessToken]) 

    const _login = async (loginData) => {
        const response = await login(loginData)
        setUser(response.user)
        setAccessToken(response.accessToken)
        localStorage.setItem(LS_ACCESS_TOKEN_KEY, response.accessToken)
    }

    const _getMe = async () => {
        try {
            const _user = await getMe()
            setUser(_user)
        } catch(error) {
            console.warn("Unable to get ME", error)
            _logout()
        }
    } 
    
    const _logout = () => {
        setUser(defaultState.user)
        setAccessToken(defaultState.accessToken)
        localStorage.removeItem(LS_ACCESS_TOKEN_KEY)
    }

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            actions: {
                login: _login,
                logout: _logout
            }
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const auth = useContext(AuthContext)

    return auth
}
