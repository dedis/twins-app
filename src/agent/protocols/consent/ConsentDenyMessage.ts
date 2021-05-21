import { AgentMessage } from "@gnarula/aries-framework-javascript/build/lib/agent/AgentMessage";
import {MessageType} from './messages';

export class ConsentDenyMessage extends AgentMessage {
  /**
   * Create new ConsentDenyMessage instance.
   */
  public constructor() {
    super();
    this.id = this.generateId();
  }

  public readonly type = ConsentDenyMessage.type;
  public static readonly type = MessageType.ConsentDenyMessage;
}
