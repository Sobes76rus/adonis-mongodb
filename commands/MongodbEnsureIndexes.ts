import { inject, BaseCommand, flags } from '@adonisjs/core/build/standalone';

import { MongodbContract } from '@ioc:Mongodb/Database';
import { AutoIncrementModel, Model } from '@ioc:Mongodb/Model';

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

  @inject(['Mongodb/Database', 'Mongodb/Model', 'App/Models'])
  public async run(
    db: MongodbContract,
    ModelNS: any,
    _: typeof Model[] | typeof AutoIncrementModel[],
  ): Promise<void> {
    if (this.connection && !db.hasConnection(this.connection)) {
      this.logger.error(
        `no MongoDB connection registered with name "${this.connection}"`,
      );

      process.exitCode = 1;
      return;
    }

    const tModel: typeof Model = ModelNS.Model;
    // @ts-ignore
    for (let model of tModel.$allModels) {
      const indexes = model.prepareIndexes(model);
      const collection = await model.getCollection();

      for (let index of indexes) {
        // @ts-ignore
        this.logger.info(`Create index on ${model.name}`);
        await collection.createIndex(index.keys, index.opts);
      }
    }
  }
}
