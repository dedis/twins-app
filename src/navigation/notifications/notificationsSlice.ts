import { LayoutItem } from '../../model/layout-item.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseRecord } from 'aries-framework-javascript/build/lib/storage/BaseRecord';

type NotificationPayload = {}

export enum NotificationState {
  INVITED,
  INVITE_DENIED,
  INFORMATION_REQUESTED,
  INFORMATION_PROVIDED,
  INFORMATION_FAILURE,
  CONSENT_GRANTED,
  CONSENT_DENIED,
}

export type NotificationItem<T extends NotificationPayload> = {
    id: string
    state: NotificationState
    payload: T
} & LayoutItem

type NotificationsState = {
    itemsById: Record<string, NotificationItem<NotificationPayload>>
    items: NotificationItem<NotificationPayload>[]
}

interface NotificationStateUpdate<T extends NotificationPayload> {
    id: string
    state: NotificationState
    payload: T
}

const initialState: NotificationsState = { items: [], itemsById: {} }

const notifications = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification(state, action: PayloadAction<NotificationItem<NotificationPayload>>) {
            state.items.push(action.payload);
            state.itemsById[action.payload.id] = action.payload;
        },
        addNotifications(state, action: PayloadAction<NotificationItem<NotificationPayload>[]>) {
            state.items.push(...action.payload);
            for (let i = 0; i < action.payload.length; i++) {
                const item = action.payload[i];
                state.itemsById[item.id] = item;
            }
        },
        updateNotificationState(state, action: PayloadAction<NotificationStateUpdate<NotificationPayload>>) {
            const stateUpdate = action.payload;
            const idx = state.items.findIndex(item => item.id === stateUpdate.id);
            state.items[idx].payload = stateUpdate.payload;
            state.items[idx].state = stateUpdate.state;
            state.itemsById[stateUpdate.id].payload = stateUpdate.payload;
            state.itemsById[stateUpdate.id].state = stateUpdate.state;
        }
    }
});

export default notifications.reducer;
export const { addNotification, addNotifications, updateNotificationState } = notifications.actions;