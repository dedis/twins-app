import debug from 'debug';
// @ts-ignore
import indy from 'rn-indy-sdk';

import {
  RealTimeInboundTransporter,
  HTTPOutboundTransporter,
} from './transport/transporters';
import {InitConfig} from '@gnarula/aries-framework-javascript/build/lib/types';
import {
  Agent,
  InboundTransporter,
  OutboundTransporter,
} from '@gnarula/aries-framework-javascript';
import {ConsentService} from './protocols/consent/ConsentService';
import {EventEmitter} from 'events';
import {
  EventType,
  StateChangeEvent,
  ExchangeService,
} from '@gnarula/aries-framework-javascript/build/lib/protocols/didexchange/ExchangeService';
import {fetchAndAddConnection} from 'src/navigation/connections/connectionsSlice';
import {MessageRepository} from '@gnarula/aries-framework-javascript/build/lib/storage/MessageRepository';
import {SignalRClientModule} from './module/SignalRClientModule';
import {SignalRRoutingModule} from './module/SignalRoutingModule';
import {CustomConsumerRoutingService} from './protocols/routing/ConsumerRoutingService';
import logger from '@gnarula/aries-framework-javascript/build/lib/logger';
import {ConnectionState} from '@gnarula/aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState';
import store from 'src/app/store';
import {ConsentInvitationHandler} from './handlers/consent/ConsentInvitationHandler';
import {Repository} from '@gnarula/aries-framework-javascript/build/lib/storage/Repository';
import {ConsentRecord} from './protocols/consent/ConsentRecord';
import {ConsentModule} from './module/ConsentModule';
import {ConsentInformationResponseHandler} from './handlers/consent/ConsentInformationResponseHandler';
import {CredentialRecord} from '@gnarula/aries-framework-javascript/build/lib/storage/CredentialRecord';
import {CredentialState} from '@gnarula/aries-framework-javascript/build/lib/protocols/credentials/CredentialState';
import {
  addNotification,
  NotificationItem,
  NotificationState,
} from 'src/navigation/notifications/notificationsSlice';
import {classToPlain} from 'class-transformer';

debug.enable('@gnarula/aries-framework-javascript');

export class EdgeAgent extends Agent {
  protected consentService: ConsentService;
  protected consentRepository: Repository<ConsentRecord>;
  protected eventEmitters: Set<EventEmitter>;

  public signalRRoutingModule!: SignalRRoutingModule;
  public signalRClientModule!: SignalRClientModule;
  public consentModule!: ConsentModule;

  public constructor(
    initialConfig: InitConfig,
    inboundTransporter: InboundTransporter,
    outboundTransporter: OutboundTransporter,
    indyRef: Indy,
    messageRepository?: MessageRepository,
  ) {
    super(
      initialConfig,
      inboundTransporter,
      outboundTransporter,
      indyRef,
      messageRepository,
    );
    this.eventEmitters = new Set();
    this.consentRepository = new Repository<ConsentRecord>(
      ConsentRecord,
      this.storageService,
    );

    // We have our own implementation of ConsumerRoutingService
    this.consumerRoutingService = new CustomConsumerRoutingService(
      this.messageSender,
      this.agentConfig,
    );
    this.didexchangeService = new ExchangeService(
      this.wallet,
      this.agentConfig,
      this.connectionRepository,
      this.ledgerService,
      this.consumerRoutingService,
    );
    this.consentService = new ConsentService(
      this.didexchangeService,
      this.messageSender,
      this.consentRepository,
      this.connectionRepository,
      this.wallet,
    );
    // @ts-ignore
    this.dispatcher.handlers = [];
    this.registerHandlers();
    this.registerModules();
    logger.log('done with constructor');
    // @ts-ignore
    logger.log('handlers', this.dispatcher.handlers);
  }

  protected registerHandlers() {
    super.registerHandlers();
    this.dispatcher.registerHandler(
      new ConsentInvitationHandler(this.consentService),
    );
    this.dispatcher.registerHandler(
      new ConsentInformationResponseHandler(this.consentService),
    );
  }

  public registerEventHandler(
    eventEmitter: EventEmitter,
    eventType: string,
    handler: (...args: any) => void,
  ) {
    this.eventEmitters.add(eventEmitter);
    eventEmitter.on(eventType, handler);
  }

  public destroyEventHandlers() {
    for (const eventEmitter of this.eventEmitters) {
      eventEmitter.removeAllListeners();
    }
  }

  protected registerModules() {
    super.registerModules();
    this.signalRRoutingModule = new SignalRRoutingModule(
      this.agentConfig,
      this.provisioningService,
      this.connectionService,
      this.messageSender,
      this.consumerRoutingService,
      this.wallet,
    );
    this.signalRClientModule = new SignalRClientModule(
      this.provisioningService,
      this.connectionService,
      //@ts-ignore
      this.messageReceiver.envelopeService,
      this.messageReceiver,
      this.agentConfig,
    );
    this.consentModule = new ConsentModule(
      this.consentService,
      this.messageSender,
    );
  }
}

class AgentModule {
  private agent: EdgeAgent | null = null;
  private inboundTransporter: InboundTransporter;
  private outboundTransporter: OutboundTransporter;
  private _initialized: boolean;

  constructor() {
    // Initializations
    this.inboundTransporter = new RealTimeInboundTransporter();
    this.outboundTransporter = new HTTPOutboundTransporter();
    this._initialized = false;
  }

  public getAgent(): EdgeAgent | null {
    return this.agent;
  }

  public async init(config: InitConfig) {
    this.agent = new EdgeAgent(
      config,
      this.inboundTransporter,
      this.outboundTransporter,
      indy,
    );

    // Event Handlers
    const didExchangeEventEmitter = this.agent.didexchange.events();
    // @ts-ignore
    const credentialEventEmitter = this.agent.credentials.credentialService;

    this.agent.registerEventHandler(
      didExchangeEventEmitter,
      EventType.StateChanged,
      (event: StateChangeEvent) => {
        if (event.state === ConnectionState.COMPLETE) {
          logger.log('Established Connection');
          store.dispatch(
            fetchAndAddConnection(this.agent!, event.connectionId),
          );
        }
      },
    );

    this.agent.registerEventHandler(
      credentialEventEmitter,
      EventType.StateChanged,
      async (event: any) => {
        const {
          credential,
        }: {credential: CredentialRecord; prevState: string} = event;
        if (credential.state === CredentialState.OfferReceived) {
          logger.log('Got credential offer');
          const connection = await this.agent?.connections.find(
            credential.connectionId,
          );
          const serialized = classToPlain(credential);
          console.log('credential', serialized);
          const item: NotificationItem<{}> = {
            title: 'Credential Offer',
            description: `You've received a credential offer from ${connection?.theirDid}`,
            id: credential.id,
            state: NotificationState.CREDENTIAL_OFFERED,
            payload: serialized,
          };
          store.dispatch(addNotification(item));
        }
      },
    );

    await this.agent.init();
    this._initialized = true;
  }

  public initialized(): boolean {
    return this._initialized;
  }
}

const instance = new AgentModule();
export default instance;
