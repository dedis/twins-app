// @ts-ignore
import {v4 as uuid} from 'uuid';
import {BaseRecord} from '@gnarula/aries-framework-javascript/build/lib/storage/BaseRecord';
import {NotificationState} from 'src/navigation/notifications/notificationsSlice';

declare module '@gnarula/aries-framework-javascript/build/lib/storage/BaseRecord' {
  export enum RecordType {
    ConsentRecord = 'ConsentRecord',
  }
}

import {RecordType} from '@gnarula/aries-framework-javascript/build/lib/storage/BaseRecord';

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
