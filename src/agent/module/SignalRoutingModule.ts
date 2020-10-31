import {AgentConfig} from 'aries-framework-javascript/build/lib/agent/AgentConfig';
import {ProvisioningService} from 'aries-framework-javascript/build/lib/agent/ProvisioningService';
import {ConnectionService} from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionService';
import {MessageSender} from 'aries-framework-javascript/build/lib/agent/MessageSender';
import logger from 'aries-framework-javascript/build/lib/logger';
import {ConnectionResponseMessage} from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionResponseMessage';
import {Wallet} from 'aries-framework-javascript/build/lib/wallet/Wallet';
import {ConnectionState} from 'aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState';
import {createOutboundMessage} from 'aries-framework-javascript/build/lib/protocols/helpers';
import {CreateInboxMessage} from '../protocols/routing/CreateInboxMessage';
import {AgentMessage} from 'aries-framework-javascript/build/lib/agent/AgentMessage';
import {ConsumerRoutingService} from 'aries-framework-javascript/build/lib/protocols/routing/ConsumerRoutingService';

export class SignalRRoutingModule {
  private agentConfig: AgentConfig;
  private provisioningService: ProvisioningService;
  private connectionService: ConnectionService;
  private messageSender: MessageSender;
  private wallet: Wallet;
  private consumerRoutingService: ConsumerRoutingService;

  public constructor(
    agentConfig: AgentConfig,
    provisioningService: ProvisioningService,
    connectionService: ConnectionService,
    messageSender: MessageSender,
    consumerRoutingService: ConsumerRoutingService,
    wallet: Wallet,
  ) {
    this.agentConfig = agentConfig;
    this.provisioningService = provisioningService;
    this.connectionService = connectionService;
    this.messageSender = messageSender;
    this.consumerRoutingService = consumerRoutingService;
    this.wallet = wallet;
  }

  public async provision() {
    logger.log('Trying to fetch record');
    let provisioningRecord = await this.provisioningService.find();

    if (!provisioningRecord) {
      logger.log(
        'There is no provisioning. Creating connection with agency...',
      );

      const inviteUrl = `${this.agentConfig.agencyUrl}/.well-known/agent-configuration`;
      const invitationMessage = await (await fetch(inviteUrl)).json();
      logger.logJson(
        'Creating connectionRequest with invitation',
        invitationMessage,
      );
      const connectionRequest = await this.connectionService.acceptInvitation(
        invitationMessage.Invitation,
      );
      logger.log('Sending connectionRequest');
      const connectionResponse = await this.messageSender.sendAndReceiveMessage(
        connectionRequest,
        ConnectionResponseMessage,
      );
      logger.log('Got connectionResponse');
      const ack = await this.connectionService.acceptResponse(
        connectionResponse,
      );
      ack.payload.responseRequested = false;
      const connection = connectionResponse.connection;
      if (connection && connection.theirDidDoc) {
        connection.theirDidDoc.service[0].routingKeys = [];
        this.connectionService.updateState(connection, connection.state);
        ack.routingKeys = [];
      }
      await this.messageSender.sendMessage(ack);
      logger.log('Sent ack');

      const cInboxMessage = createOutboundMessage(
        connection!,
        new CreateInboxMessage(),
      );
      await this.messageSender.sendAndReceiveMessage(
        cInboxMessage,
        AgentMessage,
      );

      const provisioningProps = {
        agencyConnectionId: connectionRequest.connection.id,
        agencyPublicVerkey: connectionRequest.connection.theirKey!,
      };
      provisioningRecord = await this.provisioningService.create(
        provisioningProps,
      );
      logger.log('Provisioning record has been saved.');
    }

    logger.log('Provisioning record:', provisioningRecord);

    const agentConnectionAtAgency = await this.connectionService.find(
      provisioningRecord.agencyConnectionId,
    );

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

    if (this.agentConfig.publicDidSeed) {
      try {
        await this.consumerRoutingService.createRoute(
          this.wallet.getPublicDid()!.verkey,
        );
      } catch (err) {
        // ignore if the route already exists
      }
    }

    return agentConnectionAtAgency;
  }

  public getInboundConnection() {
    return this.agentConfig.inboundConnection;
  }
}
