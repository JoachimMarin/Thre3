import GameManager from 'Game/GameManager';
import Inventory from 'Game/Level/GameState/Inventory';
import FileSystemLevelParser from 'Headless/FileSystemLevelParser';
import { program } from 'commander';

// the web game runs in ./dist, so to be able to access the same files, headless should run there too
process.chdir('./dist');

program
  .name('Thre3-headless')
  .description('CLI for running Thre3 headless.')
  .version('dev');

program
  .command('solve <level>')
  .description(
    'Uses the brute force solver to compute a shortest solution path for the given level.'
  )
  .action((level) => {
    GameManager.Init(
      new FileSystemLevelParser(),
      undefined,
      () => new Inventory()
    );
    GameManager.SolveLevel(level);
  });

program.parse();
