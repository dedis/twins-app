import { combineReducers } from '@reduxjs/toolkit'
import connectionReducer from '../navigation/connections/connectionsSlice'

const rootReducer = combineReducers({
    connections: connectionReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer