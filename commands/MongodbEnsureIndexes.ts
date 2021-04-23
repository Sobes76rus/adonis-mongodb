import { join } from 'path';

import {
  inject,
  BaseCommand,
  args,
  flags,
} from '@adonisjs/core/build/standalone';

import { MongodbContract } from '@ioc:Mongodb/Database';
import { Model } from '@ioc:Mongodb/Model';

export default class MongodbEnsureIndexes extends BaseCommand {
  public static commandName = 'mongodb:ensure-indexes';
  public static description = 'Ensure indexes';
  public static settings = {
    loadApp: true,
  };

  @flags.string({
    description: 'Database connection to use for the ensure indexes',
  })
  public connection: string;

  @inject(['Mongodb/Database', 'Mongodb/Model'])
  public async run(db: MongodbContract): Promise<void> {
    if (this.connection && !db.hasConnection(this.connection)) {
      this.logger.error(
        `no MongoDB connection registered with name "${this.connection}"`,
      );

      // @ts-ignore
      for (let model of Model.$allModels) {
        const indexes = model.prepareIndexes(model);
        const collection = await Model.getCollection();

        for (let index of indexes) {
          // @ts-ignore
          this.logger.info(`Create index on ${collection.name}`);
          await collection.createIndex(index.keys, index.opts);
        }
      }

      process.exitCode = 1;
      return;
    }
  }
}
