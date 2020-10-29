// @ts-ignore
import {v4 as uuid} from 'uuid';
import {
  BaseRecord,
  RecordType,
} from 'aries-framework-javascript/build/lib/storage/BaseRecord';
import {NotificationState} from 'src/navigation/notifications/notificationsSlice';

declare module 'aries-framework-javascript/build/lib/storage/BaseRecord' {
  export enum RecordType {
    ConsentRecord = 'ConsentRecord',
  }
}

export interface ConsentStorageProps {
  id?: string;
  tags: {[keys: string]: string};
  cohortID: string;
  invite?: {};
  connectionID?: string;
  state: NotificationState;
  information?: {};
}

export class ConsentRecord extends BaseRecord implements ConsentStorageProps {
  public invite?: {};
  public information?: {};
  public cohortID: string;
  public state: NotificationState;
  public connectionID?: string;

  // @ts-ignore
  public static readonly type: RecordType = 'ConsentRecord';
  // @ts-ignore
  public readonly type = 'ConsentRecord';

  public constructor(props: ConsentStorageProps) {
    super(props.id || uuid());
    this.information = props.information;
    this.invite = props.invite;
    this.cohortID = props.cohortID;
    this.state = props.state;
    this.connectionID = props.connectionID;
  }
}
