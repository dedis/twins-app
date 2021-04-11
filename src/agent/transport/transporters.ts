import {
  InboundTransporter,
  OutboundTransporter,
} from '@gnarula/aries-framework-javascript';
import {OutboundPackage} from '@gnarula/aries-framework-javascript/build/lib/types';
import {EdgeAgent} from '../agent';
import logger from '@gnarula/aries-framework-javascript/build/lib/logger';

export class RealTimeInboundTransporter implements InboundTransporter {
  state: number = 0;
  agent!: EdgeAgent;

  async start(agent: EdgeAgent) {
    // TODO: add check if connection is already established with agency
    // after we add support for persisting connections
    this.agent = agent;
    logger.log('Gonna provision routing module');
    await agent.signalRRoutingModule.provision();
    logger.log('initializing signalRClient');
    try {
      await agent.signalRClientModule.init();
    } catch (err) {
      logger.log('Error initializing signalR connection', err);
    }
  }

  toggle() {
    if (this.state === 0) {
      this.agent.signalRClientModule.connection?.stop();
    } else {
      this.agent.signalRClientModule.connection?.start();
    }
    this.state ^= 1;
  }
}

export class HTTPOutboundTransporter implements OutboundTransporter {
  async sendMessage(
    outboundPackage: OutboundPackage,
    receive_reply: boolean,
  ): Promise<any> {
    const contentType = 'application/didcomm-envelope-enc';
    const body = await fetch(outboundPackage.endpoint || '', {
      headers: [['Content-Type', contentType]],
      method: 'POST',
      body: JSON.stringify(outboundPackage.payload),
    });
    if (receive_reply) {
      return await body.json();
    }
    return null;
  }
}
