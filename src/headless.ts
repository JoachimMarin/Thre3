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
  .action((level) => {
    GameManager.Init(
      new FileSystemLevelParser(),
      undefined,
      () => new Inventory()
    );
    console.log('paths:');
    for (const path of GameManager.SolveLevel(level)) {
      console.log(path.toString());
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
