import { createContext } from 'react'
import { AuthReturnData } from '../types/auth'

export const AuthContext = createContext({} as AuthReturnData)