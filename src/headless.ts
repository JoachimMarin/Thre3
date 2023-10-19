import GameManager from 'Game/GameManager';
import Inventory from 'Game/Level/GameState/Inventory';
import FileSystemLevelParser from 'Headless/FileSystemLevelParser';
import InitHeadless from 'Headless/InitHeadless';
import { program } from 'commander';

InitHeadless();

program
  .name('Thre3-headless')
  .description('CLI for running Thre3 headless.')
  .version('dev');

program
  .command('solve <level>')
  .description(
    'Uses the brute force solver to compute a shortest solution path for the given level.'
  )
  .option('-r --raw', 'Returns the solution path as direction index string.')
  .action((level, options) => {
    GameManager.Init(
      new FileSystemLevelParser(),
      undefined,
      () => new Inventory()
    );
    const path = GameManager.SolveLevel(level);
    if (path !== undefined) {
      console.log(
        options['raw']
          ? path[0].toString('', false, undefined)
          : path[0].toString('\n', true, path[1])
      );
    } else {
      console.log('Goal cannot be reached.');
    }
  });
program
  .command('verify <level>')
  .description(
    'Verifies that the given level can be solved by the solution specified in the level file.'
  )
  .action((level) => {
    GameManager.Init(
      new FileSystemLevelParser(),
      undefined,
      () => new Inventory()
    );
    console.log(GameManager.VerifyLevel(level));
  });

program.parse();
