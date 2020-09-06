import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";
import { Equals } from "class-validator";

export interface CreateInboxMessageOptions {
    id?: string
    metadata: {}
}

export enum MessageType {
    CreateInboxMessage = 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basic-routing/1.0/create-inbox',
}

export class CreateInboxMessage extends AgentMessage {
  /**
   * Create new ForwardMessage instance.
   *
   * @param options
   */
  public constructor(options?: CreateInboxMessageOptions) {
    super();

    if (options) {
        this.metadata = options.metadata;
        this.id = options.id || this.generateId();
    } else {
        this.id = this.generateId();
        this.metadata = {};
    }
  }

  public readonly type = CreateInboxMessage.type;
  public static readonly type = MessageType.CreateInboxMessage;

  public metadata!: {}
  public id: string
}
