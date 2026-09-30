import { useContext } from 'react'

import { DispatchCompaniesContext } from '../components/MaxSessionProvider'

export const useDispatchCompanies = () => useContext(DispatchCompaniesContext)
