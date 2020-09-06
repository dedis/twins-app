import RNFS from 'react-native-fs';
import debug from 'debug';
// @ts-ignore
import indy from 'rn-indy-sdk';

import { RealTimeInboundTransporter, HTTPOutboundTransporter } from "./transport/transporters";
import { InitConfig } from "aries-framework-javascript/build/lib/types";
import { mediatorURL } from "../app/config";
import { Agent, InboundTransporter, OutboundTransporter } from "aries-framework-javascript";
import { ConsentRequestHandler } from "./handlers/consent/ConsentRequestHandler";
import { ConsentChallengeResponseHandler } from "./handlers/consent/ConsentChallengeResponseHandler";
import { ConsentService } from './protocols/consent/ConsentService';
import { EventEmitter } from 'events';
import { EventType, StateChangeEvent } from 'aries-framework-javascript/build/lib/protocols/didexchange/ExchangeService';
import { fetchAndAddConnection } from 'src/navigation/connections/connectionsSlice';
import { MessageRepository } from 'aries-framework-javascript/build/lib/storage/MessageRepository';
import { SignalRClientModule } from './module/SignalRClientModule';
import { SignalRRoutingModule } from './module/SignalRoutingModule';
import { CustomConsumerRoutingService } from './protocols/routing/ConsumerRoutingService';
import logger from "aries-framework-javascript/build/lib/logger"

debug.enable('aries-framework-javascript');

export class EdgeAgent extends Agent {
  protected consentService: ConsentService;
  protected eventEmitters: Set<EventEmitter>

  public signalRRoutingModule!: SignalRRoutingModule
  public signalRClientModule!: SignalRClientModule

  public constructor(
    initialConfig: InitConfig,
    inboundTransporter: InboundTransporter,
    outboundTransporter: OutboundTransporter,
    indy: Indy,
    messageRepository?: MessageRepository
  ) {
    super(initialConfig, inboundTransporter, outboundTransporter, indy, messageRepository);
    this.consentService = new ConsentService();
    this.eventEmitters = new Set();

    // We have our own implementation
    this.consumerRoutingService = new CustomConsumerRoutingService(this.messageSender, this.agentConfig);
    // @ts-ignore
    this.dispatcher.handlers = [];
    this.registerHandlers();
    this.registerModules();
    logger.log('done with constructor')
    // @ts-ignore
    logger.log('handlers', this.dispatcher.handlers)
  }

  protected registerHandlers() {
    super.registerHandlers();
    this.dispatcher.registerHandler(new ConsentRequestHandler(this.consentService, this.connectionService));
    this.dispatcher.registerHandler(new ConsentChallengeResponseHandler());
  }

  public registerEventHandler(eventEmitter: EventEmitter, eventType: string, handler: (...args: any) => void) {
    this.eventEmitters.add(eventEmitter)
    eventEmitter.on(eventType, handler)
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
    );
    this.signalRClientModule = new SignalRClientModule(
      this.provisioningService,
      this.connectionService,
      //@ts-ignore
      this.messageReceiver.envelopeService,
      this.messageReceiver,
      this.agentConfig,
    )
  }
}

class AgentModule {
  private agent: EdgeAgent

  constructor() {
    // Initializations
    const inboundTransporter = new RealTimeInboundTransporter();
    const outboundTransporter = new HTTPOutboundTransporter();

    const config: InitConfig = {
      label: 'EdgeAgent',
      agencyUrl: mediatorURL,
      url: mediatorURL,
      port: 80,
      walletConfig: {
        id: 'EdgeWallet',
        storage_config: {
          path: RNFS.DocumentDirectoryPath + '/.indy_wallet',
        },
      },
      walletCredentials: {
        key: '1234',
      },
    };
    console.log('instantiated agent');
    this.agent = new EdgeAgent(
      config,
      inboundTransporter,
      outboundTransporter,
      indy,
    );

    // Event Handlers
    const didExchangeEventEmitter = this.agent.didexchange.events()

    this.agent.registerEventHandler(didExchangeEventEmitter, EventType.StateChanged, (event: StateChangeEvent) => {
      fetchAndAddConnection(this.agent, event.connectionId);
    });
  }

  public getAgent(): EdgeAgent {
    return this.agent;
  }
}

const instance = new AgentModule();
export default instance;
