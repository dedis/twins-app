import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LayoutItem } from '../../model/layout-item.model'
import { Agent } from 'aries-framework-javascript'
import {  AppThunk } from '../../app/store'
import logger from 'aries-framework-javascript/build/lib/logger'

type ConnectionsState = {
    items: LayoutItem[]
}

const initialState: ConnectionsState = { items: [] }

const connections = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        addConnection(state, action: PayloadAction<LayoutItem>) {
            logger.log('pushing into state');
            state.items.push(action.payload)
        },
        addConnections(state, action: PayloadAction<LayoutItem[]>) {
            state.items.push(...action.payload)
        }
    }
})

export const { addConnection, addConnections }  = connections.actions
export default connections.reducer

export const fetchAndAddConnection = (
    agent: Agent,
    connectionId: string
): AppThunk => async dispatch => {
    const connection = await agent.didexchange.find(connectionId);
    logger.log('found connection');
    if (connection !== null) {
        logger.log('dispatching addConnection');
        const item: LayoutItem = {
            title: connection.invitation?.label!,
            description: `Connected using identifier: ${connection.did}`,
        }
        dispatch(addConnection(item))
    }
}