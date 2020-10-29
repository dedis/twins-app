import {AgentMessage} from 'aries-framework-javascript/build/lib/agent/AgentMessage';
import {MessageType} from './messages';

export interface ConsentGrantMessageOptions {
  id?: string;
  writeInstanceID: string;
  filename: string;
}

export class ConsentGrantMessage extends AgentMessage {
  /**
   * Create new ConsentRequestMessage instance.
   *
   * @param options
   */
  public constructor(options: ConsentGrantMessageOptions) {
    super();
    if (options) {
      this.id = options.id || this.generateId();
      this.writeInstanceID = options.writeInstanceID;
      this.filename = options.filename;
    }
  }

  public readonly type = ConsentGrantMessage.type;
  public static readonly type = MessageType.ConsentGrantMessage;

  public id!: string;

  public writeInstanceID!: string;

  public filename!: string;
}
