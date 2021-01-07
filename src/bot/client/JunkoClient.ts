import { Message } from 'discord.js';
import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler
} from 'discord-akairo';
import { Connection } from 'typeorm';
import { join } from 'path';
import Database from '../structs/Database';
import { Settings } from '../models/Settings';
import { SettingsProvider } from '../structs/SettingsProvider';
import { Myriag } from '../structs/Myriag';
import { Prometheus } from '../structs/Prometheus';
import { ReplyManager } from '../structs/ReplyMenager';
import { Logger } from '../structs/Logger';

interface JunkoConf {
  ownerID: string;
  token: string;
  color: string;
  defaultPrefix: string;
  defaultPreset: string;
}

declare module 'discord-akairo' {
  interface AkairoClient {
    config: JunkoConf;
    db: Connection;
    settings: SettingsProvider;
    myriag: Myriag;
    prometheus: Prometheus;
    replyManager: ReplyManager;
    logger: Logger;
    commandHandler: CommandHandler;
  }
}

export default class JunkoClient extends AkairoClient {
  public config: JunkoConf;

  public prometheus = new Prometheus();

  public replyManager = new ReplyManager(this);

  public logger = new Logger();

  public myriag = new Myriag();

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix: (msg: Message) =>
      this.settings.get(msg.guild, 'prefix', this.config.defaultPrefix),
    aliasReplacement: /-/g,
    allowMention: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 3000,
    argumentDefaults: {
      prompt: {
        modifyStart: (msg: Message, text: string) =>
          this.replyManager.modifyStart(msg, text),
        modifyRetry: (msg: Message, text: string) =>
          this.replyManager.modifyRetry(msg, text),
        timeout: (msg: Message) => this.replyManager.timeout(msg),
        ended: (msg: Message) => this.replyManager.ended(msg),
        cancel: (msg: Message) => this.replyManager.cancel(msg),
        retries: 3,
        time: 20000
      },
      otherwise: ''
    }
  });

  public inhibitorHandler = new InhibitorHandler(this, {
    directory: join(__dirname, '..', 'inhibitors')
  });

  public listenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners')
  });

  public constructor(config: JunkoConf) {
    super({ ownerID: config.ownerID });
    this.config = config;
  }

  private async init() {
    this.db = await Database.get('junko').connect();
    this.settings = new SettingsProvider(this.db.getRepository(Settings));

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.prometheus.listen();
  }

  public async start() {
    await this.init();
    this.login(this.config.token);
  }
}
