import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';
import {ProvisioningService} from 'aries-framework-javascript/build/lib/agent/ProvisioningService';
import {AgentConfig} from 'aries-framework-javascript/build/lib/agent/AgentConfig';
import {createOutboundMessage} from 'aries-framework-javascript/build/lib/protocols/helpers';
import {AuthorizeResponseMessage} from '../protocols/routing/AuthorizeResponseMessage';
import {ConnectionService} from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionService';
import {EnvelopeService} from 'aries-framework-javascript/build/lib/agent/EnvelopeService';
import {MessageReceiver} from 'aries-framework-javascript/build/lib/agent/MessageReceiver';
import logger from 'aries-framework-javascript/build/lib/logger';

export class SignalRClientModule {
  provisioningService: ProvisioningService;
  connectionService: ConnectionService;
  envelopeService: EnvelopeService;
  messageReceiver: MessageReceiver;
  connection?: HubConnection;

  constructor(
    provisioningService: ProvisioningService,
    connectionService: ConnectionService,
    envelopeService: EnvelopeService,
    messageReceiver: MessageReceiver,
    agentConfig: AgentConfig,
  ) {
    this.provisioningService = provisioningService;
    this.connectionService = connectionService;
    this.envelopeService = envelopeService;
    this.messageReceiver = messageReceiver;
    this.connection = new HubConnectionBuilder()
      .withUrl(`${agentConfig.agencyUrl}/hub`, HttpTransportType.LongPolling)
      .configureLogging(LogLevel.Debug)
      .build();
    this.registerHandlers();
    this.connection.onclose((err) => {
      logger.log('Connection closed', err);
    });
    this.connection.onreconnected(() => {
      logger.log('Connection restablished');
    });
  }

  async init() {
    if (this.connection) {
      return this.connection.start();
    }
  }

  close() {
    if (this.connection) {
      return this.connection.stop();
    }
  }

  registerHandlers() {
    this.connection?.on('Authorize', async (nonce: string) => {
      const response = new AuthorizeResponseMessage({nonce});
      const provisioningRecord = await this.provisioningService.find();
      if (!provisioningRecord?.agencyConnectionId) {
        throw new Error('Agency not provisioned');
      }
      const connection = await this.connectionService.find(
        provisioningRecord?.agencyConnectionId,
      );
      const outboundMessage = createOutboundMessage(connection!, response);
      const packedMessage = await this.envelopeService.packMessage(
        outboundMessage,
      );
      await this.connection?.invoke(
        'AuthorizeResponse',
        JSON.stringify(packedMessage.payload),
      );
    });

    this.connection?.on('HandleMessage', async (message: string, _: number) => {
      // const ack = {
      //     '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/acknowledge/1.0/acknowledge',
      //     '@id': '12341234',
      //     itemId,
      // }
      // const outboundMessage = createOutboundMessage(this.agencyConnection, ack);
      // const packedMessage = await this.agent.context.messageSender.packMessage(outboundMessage);
      console.log('Received message');
      await this.messageReceiver.receiveMessage(JSON.parse(message));
      // await this.connection?.invoke('Acknowledge', JSON.stringify(packedMessage));
    });
  }
}
