import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LayoutItem } from '../model/layout-item.model'
import { Agent } from 'aries-framework-javascript'
import { AppThunk } from '../../app/store'

type ConnectionsState = {
    items: LayoutItem[]
}

const initialState: ConnectionsState = { items: [] }

const connections = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        addConnection(state, action: PayloadAction<LayoutItem>) {
            state.items.push(action.payload)
        }
    }
})

export const { addConnection }  = connections.actions
export default connections.reducer

export const fetchAndAddConnection = (
    agent: Agent,
    connectionId: string
): AppThunk => async dispatch => {
    const connection = await agent.didexchange.find(connectionId);
    if (connection !== null) {
        const item: LayoutItem = {
            title: connection.invitation?.label!,
            description: `Connected using identifier: ${connection.did}`,
        }
        dispatch(addConnection(item))
    }
}