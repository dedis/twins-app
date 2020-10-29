// @ts-ignore
import {poll} from 'await-poll';
import {ConsentInvitationMessage} from './ConsentInvitationMessage';
import store from 'src/app/store';
import {
  NotificationItem,
  addNotification,
  NotificationState,
  updateNotificationState,
} from 'src/navigation/notifications/notificationsSlice';
import {classToPlain, plainToClass} from 'class-transformer';
import {ConnectionRecord} from 'aries-framework-javascript';
import {createOutboundMessage} from 'aries-framework-javascript/build/lib/protocols/helpers';
import {ConsentInformationRequestMessage} from './ConsentInformationRequestMessage';
import {Repository} from 'aries-framework-javascript/build/lib/storage/Repository';
import {ConsentRecord} from './ConsentRecord';
import {ExchangeService} from 'aries-framework-javascript/build/lib/protocols/didexchange/ExchangeService';
import {ConnectionInvitationMessage} from 'aries-framework-javascript/build/lib/protocols/connections/ConnectionInvitationMessage';
import {MessageSender} from 'aries-framework-javascript/build/lib/agent/MessageSender';
import {ConnectionState} from 'aries-framework-javascript/build/lib/protocols/connections/domain/ConnectionState';
import {ReturnRouteTypes} from 'aries-framework-javascript/build/lib/decorators/transport/TransportDecorator';
import {InboundMessageContext} from 'aries-framework-javascript/build/lib/agent/models/InboundMessageContext';
import {ConsentInformationResponseMessage} from './ConsentInformationResponseMessage';
import {Roster} from '@dedis/cothority/network/proto';
import {bcID, writeInstanceID, filename, documentDarc} from 'src/app/config';
import rosterData from 'src/app/roster';
import {SkipchainRPC, SkipBlock} from '@dedis/cothority/skipchain';
import ByzCoinRPC from '@dedis/cothority/byzcoin/byzcoin-rpc';
import DarcInstance from '@dedis/cothority/byzcoin/contracts/darc-instance';
import {
  IdentityDid,
  SignerEd25519,
  Rule,
  SignerDid,
} from '@dedis/cothority/darc';
import {EdgeAgent} from 'src/agent/agent';
import {
  GetUpdateChain,
  GetUpdateChainReply,
} from '@dedis/cothority/skipchain/proto';
import {Wallet} from 'aries-framework-javascript/build/lib/wallet/Wallet';
import {ConsentGrantMessage} from './ConsentGrantMessage';
import logger from 'aries-framework-javascript/build/lib/logger';
import {RecordType} from 'aries-framework-javascript/build/lib/storage/BaseRecord';
import {RosterWSConnection} from '@dedis/cothority/network';

export class ConsentService {
  private connectionRepository: Repository<ConnectionRecord>;
  // @ts-ignore
  private consentRepository: Repository<ConsentRecord>;
  private exchangeService: ExchangeService;
  private messageSender: MessageSender;
  private wallet: Wallet;

  constructor(
    exchangeService: ExchangeService,
    messageSender: MessageSender,
    consentRepository: Repository<ConsentRecord>,
    connectionRepository: Repository<ConnectionRecord>,
    wallet: Wallet,
  ) {
    this.connectionRepository = connectionRepository;
    this.exchangeService = exchangeService;
    this.consentRepository = consentRepository;
    this.messageSender = messageSender;
    this.wallet = wallet;
  }

  async receiveConsentInvitation(consentInvitation: ConsentInvitationMessage) {
    const serialized = classToPlain(consentInvitation);
    const item: NotificationItem<{}> = {
      title: 'Invitation',
      description: `An invitation to participate in a study from ${consentInvitation
        .invitation.did!}`,
      id: consentInvitation.id,
      state: NotificationState.INVITED,
      payload: serialized,
    };
    const record = new ConsentRecord({
      id: item.id,
      cohortID: consentInvitation.cohortID,
      invite: classToPlain(consentInvitation.invitation),
      tags: {},
      state: NotificationState.INVITED,
    });
    logger.log('Record type', record.type);
    await this.consentRepository.save(record);
    store.dispatch(addNotification(item));
  }

  async requestConsentInformation(invitationId: string) {
    // TODO: add record not found
    const record = await this.consentRepository.find(invitationId);
    const connectionRequest = await this.exchangeService.acceptInvitation(
      plainToClass(ConnectionInvitationMessage, record.invite!),
    );
    await this.messageSender.sendMessage(connectionRequest);
    const connectionRecord: ConnectionRecord = await poll(
      () => this.exchangeService.find(connectionRequest.connection.id),
      (c: ConnectionRecord) => c.state != ConnectionState.COMPLETE,
      10000, // High so as to ensure ack is sent as well. TODO: change this so that we wait for ack to be sent
    );

    record.connectionID = connectionRecord.id;
    const requestMessage = new ConsentInformationRequestMessage({
      cohortID: record.cohortID,
    });
    requestMessage.setThread({parentThreadId: invitationId});

    record.state = NotificationState.INFORMATION_REQUESTED;
    this.consentRepository.update(record);

    store.dispatch(
      updateNotificationState({
        id: invitationId,
        state: NotificationState.INFORMATION_REQUESTED,
        payload: record.invite!,
      }),
    );

    return createOutboundMessage(connectionRecord, requestMessage);
  }

  async denyInvite(invitationId: string) {
    logger.log('invitationId', invitationId);
    const record = await this.consentRepository.find(invitationId);
    if (record === null) {
      throw new Error('unable to find consent record');
    }
    record.state = NotificationState.INVITE_DENIED;
    this.consentRepository.update(record);
    store.dispatch(
      updateNotificationState({
        id: invitationId,
        state: NotificationState.INVITE_DENIED,
        payload: record.invite!,
      }),
    );
  }

  async receiveConsentInformation(
    messageContext: InboundMessageContext<ConsentInformationResponseMessage>,
  ) {
    const invitationId = messageContext.message.thread!.parentThreadId!;
    if (invitationId === undefined) {
      throw new Error('thread id undefined');
    }

    // TODO: add record not found
    const record = await this.consentRepository.find(invitationId);
    const serialized = classToPlain(messageContext.message);
    record.information = serialized;
    record.state = NotificationState.INFORMATION_PROVIDED;
    await this.consentRepository.update(record);
    store.dispatch(
      updateNotificationState({
        id: invitationId,
        state: NotificationState.INFORMATION_PROVIDED,
        payload: serialized,
      }),
    );
  }

  async grantConsent(invitationId: string) {
    // TODO: add record not found
    const record = await this.consentRepository.find(invitationId);
    const connectionRecord = await this.connectionRepository.find(
      record.connectionID!,
    );

    // /*
    const roster = Roster.fromTOML(rosterData);
    const genesisBlock = Buffer.from(bcID, 'hex');
    const skipchainRpc = new SkipchainRPC(roster);
    const latestBlock = await this.getLatestBlock(
      skipchainRpc,
      genesisBlock,
      false,
    );
    console.log(`LatestBlock id: ${latestBlock.hash.toString('hex')}`);
    console.log('Getting rpc instance');
    const byzcoinRPC = await ByzCoinRPC.fromByzcoin(
      roster,
      genesisBlock,
      undefined,
      undefined,
      latestBlock,
    );
    console.log('Got rpc instance');
    const darc = await DarcInstance.fromByzcoin(
      byzcoinRPC,
      Buffer.from(documentDarc, 'hex'),
    );
    const newDarc = darc.darc.evolve();
    console.log('evolved darc in memory');
    const {did: publicDid, verkey} = this.wallet.getPublicDid()!;
    const identityProps = {did: connectionRecord.theirDid, method: 'sov'}; // Other things not required since only toString is called on the identity
    const identity = new IdentityDid(identityProps);
    // await identity.init(); // no need to init
    newDarc.rules.appendToRule('spawn:calypsoRead', identity, Rule.OR);
    const signer = new SignerDid(
      async (data: Buffer, did: string) => {
        return await this.wallet.sign(data, verkey);
      },
      {did: publicDid, method: 'sov'},
    );
    console.log('created signer');
    await darc.evolveDarcAndWait(newDarc, [signer], 100);
    console.log(
      `Evolved darc and added ${publicDid} to spawn:calypsoRead rule`,
    );
    // */

    record.state = NotificationState.CONSENT_GRANTED;
    await this.consentRepository.update(record);
    store.dispatch(
      updateNotificationState({
        id: invitationId,
        state: NotificationState.CONSENT_GRANTED,
        payload: record.information!,
      }),
    );

    const consentGrantMessage = new ConsentGrantMessage({
      writeInstanceID,
      filename,
    });
    consentGrantMessage.setThread({parentThreadId: record.id});

    return createOutboundMessage(connectionRecord, consentGrantMessage);
  }

  private async getLatestBlock(
    tthis: SkipchainRPC,
    latestID: Buffer,
    verify: boolean = true,
  ) {
    const blocks: SkipBlock[] = [];
    // Run as long as there is a new blockID to be checked
    for (let previousID = Buffer.alloc(0); !previousID.equals(latestID); ) {
      previousID = latestID;
      const req = new GetUpdateChain({latestID});
      // @ts-ignore
      const ret = await tthis.conn.send<GetUpdateChainReply>(
        req,
        GetUpdateChainReply,
      );
      const newBlocks = ret.update;
      if (newBlocks.length === 0) {
        // @ts-ignore
        if (tthis.conn instanceof RosterWSConnection) {
          // @ts-ignore
          tthis.conn.invalidate(tthis.conn.getURL());
          continue;
        } else {
          console.warn('Would need a RosterWSConnection to continue');
          break;
        }
      }

      if (verify) {
        const err = tthis.verifyChain(newBlocks, latestID);
        if (err) {
          throw new Error(`invalid chain received: ${err.message}`);
        }
      }
      blocks.push(...newBlocks);

      // First check if the replying node is in the roster of the
      // latest block.
      const last = newBlocks[newBlocks.length - 1];

      if (last.forwardLinks.length === 0) {
        break;
      }

      const fl = last.forwardLinks.slice(-1)[0];
      latestID = fl.to;
      if (fl.newRoster) {
        // @ts-ignore
        if (tthis.conn instanceof RosterWSConnection) {
          // @ts-ignore
          tthis.conn.setRoster(fl.newRoster);
        } else {
          // @ts-ignore
          tthis.conn = new RosterWSConnection(
            fl.newRoster,
            SkipchainRPC.serviceName,
          );
        }
      }
    }
    return blocks.pop() as SkipBlock;
  }
}
