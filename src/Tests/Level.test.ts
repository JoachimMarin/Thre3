import GameManager from 'Game/GameManager';
import Inventory from 'Game/Level/GameState/Inventory';
import LevelList from 'Game/Level/Generation/AssetDefinitions/LevelList';
import FileSystemLevelParser from 'Headless/FileSystemLevelParser';
import InitHeadless from 'Headless/InitHeadless';

InitHeadless();

for (let i = 0; i < LevelList.length; i++) {
  const capture = i;
  test('Testing level ' + LevelList[capture].levelName + '.', () => {
    GameManager.Init(
      new FileSystemLevelParser(),
      undefined,
      () => new Inventory()
    );
    const result = GameManager.VerifyLevel(capture);
    expect(result).toBe(true);
  });
}
