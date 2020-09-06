import { AgentConfig } from "aries-framework-javascript/build/lib/agent/AgentConfig";
import { ProvisioningService } from "aries-framework-javascript/build/lib/agent/ProvisioningService";
import { ConnectionService } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionService";
import { MessageSender } from "aries-framework-javascript/build/lib/agent/MessageSender";
import logger from 'aries-framework-javascript/build/lib/logger';
import { ConnectionInvitationMessage } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage";
import { ConnectionResponseMessage } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionResponseMessage";
import { Wallet } from "aries-framework-javascript/build/lib/wallet/Wallet";
import { ConnectionState } from "aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState";
import { createOutboundMessage } from "aries-framework-javascript/build/lib/protocols/helpers";
import { CreateInboxMessage } from "../protocols/routing/CreateInboxMessage";
import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";

export class SignalRRoutingModule {
  private agentConfig: AgentConfig;
  private provisioningService: ProvisioningService;
  private connectionService: ConnectionService;
  private messageSender: MessageSender;

  public constructor(
    agentConfig: AgentConfig,
    provisioningService: ProvisioningService,
    connectionService: ConnectionService,
    messageSender: MessageSender,
  ) {
    this.agentConfig = agentConfig;
    this.provisioningService = provisioningService;
    this.connectionService = connectionService;
    this.messageSender = messageSender;
  }

  public async provision() {
    logger.log('Trying to fetch record');
    let provisioningRecord = await this.provisioningService.find();

    if (!provisioningRecord) {
      logger.log('There is no provisioning. Creating connection with agency...');

      const inviteUrl = `${this.agentConfig.agencyUrl}/.well-known/agent-configuration`;
      const invitationMessage = await (await fetch(inviteUrl)).json();
      logger.logJson('Creating connectionRequest with invitation', invitationMessage);
      const connectionRequest = await this.connectionService.acceptInvitation(invitationMessage.Invitation);
      logger.log('Sending connectionRequest');
      const connectionResponse = await this.messageSender.sendAndReceiveMessage(
        connectionRequest,
        ConnectionResponseMessage
      );
      logger.log('Got connectionResponse');
      const ack = await this.connectionService.acceptResponse(connectionResponse);
      ack.payload.responseRequested = false;
      const connection = connectionResponse.connection;
      if (connection && connection.theirDidDoc) {
          connection.theirDidDoc.service[0].routingKeys = [];
          this.connectionService.updateState(connection, connection.state);
          ack.routingKeys = [];
      }
      await this.messageSender.sendMessage(ack);
      logger.log('Sent ack');

      const provisioningProps = {
        agencyConnectionId: connectionRequest.connection.id,
        agencyPublicVerkey: connectionRequest.connection.theirKey!,
      };
      provisioningRecord = await this.provisioningService.create(provisioningProps);
      logger.log('Provisioning record has been saved.');

      const cInboxMessage = createOutboundMessage(connection!, new CreateInboxMessage());
      await this.messageSender.sendAndReceiveMessage(cInboxMessage, AgentMessage);
    }

    logger.log('Provisioning record:', provisioningRecord);

    const agentConnectionAtAgency = await this.connectionService.find(provisioningRecord.agencyConnectionId);

    if (!agentConnectionAtAgency) {
      throw new Error('Connection not found!');
    }
    logger.log('agentConnectionAtAgency', agentConnectionAtAgency);

    if (agentConnectionAtAgency.state !== ConnectionState.COMPLETE) {
      throw new Error('Connection has not been established.');
    }

    this.agentConfig.establishInbound({
      verkey: provisioningRecord.agencyPublicVerkey,
      connection: agentConnectionAtAgency,
    });

    return agentConnectionAtAgency;
  }

  public getInboundConnection() {
    return this.agentConfig.inboundConnection;
  }
}
