import GameManager from 'Game/GameManager';
import Inventory from 'Game/Level/GameState/Inventory';
import FileSystemLevelParser from 'Headless/FileSystemLevelParser';

// the web game runs in ./dist, so to be able to access the same files, headless should run there too
process.chdir('./dist');

test('Testing level 0.', () => {
  GameManager.Init(
    new FileSystemLevelParser(),
    undefined,
    () => new Inventory()
  );
  expect(GameManager.SolveLevel(0).length > 0);
});
