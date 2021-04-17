import { Logger } from '@poppinss/cliui/build/src/Logger';
export interface MigrationDescription {
    name: string;
    file: string;
}
export default function transformMigrations(rawMigrations: string[][], logger?: Logger): MigrationDescription[];
