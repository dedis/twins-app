import { AgentMessage } from "aries-framework-javascript/build/lib/agent/AgentMessage";
import { Equals, IsUUID } from "class-validator";

export interface AddRouteMessageOptions {
    routeDestination: Verkey
}

export enum MessageType {
    AddRoute = 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basic-routing/1.0/add-route',
}

export class AddRouteMessage extends AgentMessage {
  /**
   * Create new AddRouteMessage instance.
   *
   * @param options
   */
  public constructor(options: AddRouteMessageOptions) {
    super();
    this.routeDestination = options.routeDestination;
    this.id = this.generateId();
  }

  public readonly type = AddRouteMessage.type;
  public static readonly type = MessageType.AddRoute;

  public routeDestination: Verkey

  public id: string
}
