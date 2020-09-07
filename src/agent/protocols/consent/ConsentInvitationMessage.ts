import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";
import { ConnectionInvitationMessage } from "aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage";

export interface ConsentInvitationMessageOptions {
    id: string,
    invitation: ConnectionInvitationMessage,
    synopsis: string,
    cohortID: string,
}

export enum MessageType {
    InvitationMessage = 'https://dedis.epfl.ch/consent/1.0/information/invite',
}

export class ConsentInvitationMessage extends AgentMessage {
  /**
   * Create new AddRouteMessage instance.
   *
   * @param options
   */
  public constructor(options: ConsentInvitationMessageOptions) {
    super();
    if (options) {
        this.id = options.id || this.generateId();
        this.invitation = options.invitation;
        this.synopsis = options.synopsis;
        this.cohortID = options.cohortID;
    }
  }

  public readonly type = ConsentInvitationMessage.type;
  public static readonly type = MessageType.InvitationMessage;


  public id!: string

  public invitation!: ConnectionInvitationMessage

  public synopsis!: string
  
  public cohortID!: string
}
