import { join } from 'path';

import { BaseCommand, args } from '@adonisjs/core/build/standalone';

export default class MongodbMakeModel extends BaseCommand {
  public static commandName = 'mongodb:make:model';
  public static description = 'Make a new model file';
  public static settings = {
    loadApp: true,
  };

  @args.string({ description: 'Name of the model file' })
  public name: string;

  public async run(): Promise<void> {
    const { name } = this;
    if (name.includes('/')) {
      this.logger.error('name argument should not contain any slash');
      process.exitCode = 1;
      return;
    }

    const folder = 'app/Models';
    const stub = join(__dirname, '../../templates/model.txt');

    this.generator
      .addFile(name, { pattern: 'snakecase' })
      .stub(stub)
      .destinationDir(folder)
      .appRoot(this.application.makePathFromCwd())
      .apply({
        className: `${name[0].toUpperCase()}${name.slice(1)}`,
      });

    await this.generator.run();
  }
}
