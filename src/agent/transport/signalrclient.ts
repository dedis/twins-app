import { Connection, Agent } from "aries-framework-javascript";
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { createOutboundMessage } from "aries-framework-javascript/build/lib/protocols/helpers";
import async from 'async';
import { EdgeAgent } from "../agent";
import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";
import { IsString } from "class-validator";

export class SignalRClient {
    agent: EdgeAgent
    agencyConnection: Connection
    connection?: HubConnection

    constructor(agent: EdgeAgent, agencyConnection: Connection) {
        this.agent = agent;
        this.agencyConnection = agencyConnection;
        this.connection = new HubConnectionBuilder()
            .withUrl(`${agent.getAgencyUrl()}/hub`)
            .configureLogging(LogLevel.Debug)
            .build();
        this.registerHandlers()
    }

    async init() {
        if (this.connection) {
            return this.connection.start();
        }
    }

    close() {
        if (this.connection) {
            return this.connection.stop()
        }
    }

    registerHandlers() {
        this.connection?.on('Authorize', async (nonce: string) => {
            const response = new ResponseMessage({ nonce });
            const outboundMessage = createOutboundMessage(this.agencyConnection, response);
            const packedMessage = await this.agent.packMessage(outboundMessage);
            console.log(`packedMessage: ${packedMessage}`);
            await this.connection?.invoke('AuthorizeResponse', JSON.stringify(packedMessage.payload));
        });

        this.connection?.on('HandleMessage', async (message: string, itemId: number) => {
            // const ack = {
            //     '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/acknowledge/1.0/acknowledge',
            //     '@id': '12341234',
            //     itemId,
            // }
            // const outboundMessage = createOutboundMessage(this.agencyConnection, ack);
            // const packedMessage = await this.agent.context.messageSender.packMessage(outboundMessage);
            console.log('Received message');
            await this.agent.receiveMessage(JSON.parse(message));
            // await this.connection?.invoke('Acknowledge', JSON.stringify(packedMessage));
        });
    }
}
