import {AgentMessage} from 'aries-framework-javascript/build/lib/agent/AgentMessage';
import {IsString} from 'class-validator';

export enum MessageType {
  AuthorizeResponse = 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/authorize/1.0/authorize_response',
}
export class AuthorizeResponseMessage extends AgentMessage {
  public constructor(options: {nonce: string}) {
    super();
    this.nonce = options.nonce;
    this.id = this.generateId();
  }

  public readonly type = AuthorizeResponseMessage.type;
  public static readonly type = MessageType.AuthorizeResponse;

  @IsString()
  public nonce: string;

  public id: string;
}
