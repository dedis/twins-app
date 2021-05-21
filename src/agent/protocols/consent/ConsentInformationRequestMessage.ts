import {AgentMessage} from '@gnarula/aries-framework-javascript/build/lib/agent/AgentMessage';
import {MessageType} from './messages';

export interface ConsentRequestMessageOptions {
  id?: string;
  cohortID: string;
}

export class ConsentInformationRequestMessage extends AgentMessage {
  /**
   * Create new ConsentRequestMessage instance.
   *
   * @param options
   */
  public constructor(options: ConsentRequestMessageOptions) {
    super();
    if (options) {
      this.id = options.id || this.generateId();
      this.cohortID = options.cohortID;
    }
  }

  public readonly type = ConsentInformationRequestMessage.type;
  public static readonly type = MessageType.RequestMessage;

  public id!: string;

  public cohortID!: string;
}
