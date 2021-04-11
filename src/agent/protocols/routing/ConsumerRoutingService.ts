import {MessageSender} from '@gnarula/aries-framework-javascript/build/lib/agent/MessageSender';
import {AgentConfig} from '@gnarula/aries-framework-javascript/build/lib/agent/AgentConfig';
import logger from '@gnarula/aries-framework-javascript/build/lib/logger';
import {AddRouteMessage} from './AddRouteMessage';
import {createOutboundMessage} from '@gnarula/aries-framework-javascript/build/lib/protocols/helpers';
import {ConsumerRoutingService} from '@gnarula/aries-framework-javascript/build/lib/protocols/routing/ConsumerRoutingService';

class CustomConsumerRoutingService extends ConsumerRoutingService {
  _agentConfig: AgentConfig;
  _messageSender: MessageSender;

  public constructor(messageSender: MessageSender, agentConfig: AgentConfig) {
    super(messageSender, agentConfig);
    this._agentConfig = agentConfig;
    this._messageSender = messageSender;
  }

  public async createRoute(verkey: Verkey) {
    logger.log('Creating route...');

    if (!this._agentConfig.inboundConnection) {
      logger.log('There is no agency. Creating route skipped.');
    } else {
      const routingConnection = this._agentConfig.inboundConnection.connection;

      const message = new AddRouteMessage({routeDestination: verkey});
      const outboundMessage = createOutboundMessage(routingConnection, message);
      await this._messageSender.sendMessage(outboundMessage);
    }
  }
}

export {CustomConsumerRoutingService};
