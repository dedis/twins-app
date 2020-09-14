import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";
import { MessageType } from "./messages";

export interface ConsentInformationResponseMessageOptions {
    id?: string;
    description: string;
    moreInfoLink: string;
    acceptText: string;
    denyText: string;
}

export class ConsentInformationResponseMessage extends AgentMessage {
  /**
   * Create new ConsentRequestMessage instance.
   *
   * @param options
   */
  public constructor(options: ConsentInformationResponseMessageOptions) {
    super();
    if (options) {
        this.id = options.id || this.generateId();
        this.description = options.description;
        this.moreInfoLink = options.moreInfoLink;
        this.acceptText = options.acceptText;
        this.denyText = options.denyText;
    }
  }

  public readonly type = ConsentInformationResponseMessage.type;
  public static readonly type = MessageType.ResponseMessage;

  public id!: string

  public description!: string
  public moreInfoLink!: string
  public acceptText!: string
  public denyText!: string
}
