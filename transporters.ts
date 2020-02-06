import { InboundTransporter, Agent, OutboundTransporter } from "aries-framework-javascript";
import { SignalRClient } from "./signalrclient";
import { createOutboundMessage } from "aries-framework-javascript/build/lib/protocols/helpers";
import { createTrustPingMessage } from "aries-framework-javascript/build/lib/protocols/trustping/messages";
import { createCreateInboxMessage } from "aries-framework-javascript/build/lib/protocols/routing/messages";
import { OutboundPackage } from "aries-framework-javascript/build/lib/types";

export class RealTimeInboundTransporter implements InboundTransporter {
  _signalRClient?: SignalRClient

  async start(agent: Agent) {
    // TODO: add check if connection is already established with agency
    // after we add support for persisting connections
    const agencyConnection = await this.establishConnectionWithAgency(agent);
    this._signalRClient = new SignalRClient(agent, agencyConnection);
    await this._signalRClient.init();
  }

  async establishConnectionWithAgency(agent: Agent) {
    const inviteUrl = `${agent.getAgencyUrl()}/.well-known/agent-configuration`;
    const invitationMessage = await (await fetch(inviteUrl)).json();
    const connectionRequest = await agent.connectionService.acceptInvitation(invitationMessage.Invitation);
    const { connection } = connectionRequest;
    console.log('Received invitation, sending connectionRequest');
    const connectionResponsePacked = await agent.context.messageSender.sendMessageAndGetReply(connectionRequest);
    console.log('Received', connectionResponsePacked);
    const connectionResponse = await agent.context.wallet.unpack(connectionResponsePacked);
    console.log('Connection response', connectionResponse);
    await agent.connectionService.acceptResponse(connectionResponse);

    // Disable routing keys since messages will always be exchanged directly
    // We aren't using the trust ping message created above because it wraps the
    // message in a forward envelope.
    if (connection.theirDidDoc) {
      connection.theirDidDoc.service[0].routingKeys = [];
    }
    const trustPingMessage = createOutboundMessage(connection, createTrustPingMessage());
    await agent.context.messageSender.sendMessageAndGetReply(trustPingMessage);

    await connection.isConnected();

    const cInboxMessage = createOutboundMessage(connection, createCreateInboxMessage());
    await agent.context.messageSender.sendMessageAndGetReply(cInboxMessage);

    agent.establishInbound(invitationMessage.RoutingKey, connection);

    return connection;
  }

  close() {
    return this._signalRClient?.close();
  }
}

export class HTTPOutboundTransporter implements OutboundTransporter {
  async sendMessage(outboundPackage: OutboundPackage, receive_reply: boolean): Promise<any> {
    const body = await fetch(outboundPackage.endpoint || '', {
      headers: [['Content-Type', 'application/ssi-agent-wire']],
      method: 'POST',
      body: JSON.stringify(outboundPackage.payload),
    });
    if (receive_reply) {
      return await body.json();
    }
    return null;
  }
}
