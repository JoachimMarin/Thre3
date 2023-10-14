import LevelScene from 'Level/LevelScene';
import MainMenuScene from 'MainMenuScene';
import SideUserInterfaceScene from 'LevelScene/SideUserInterfaceScene';
import GridUserInterfaceScene from 'LevelScene/GridUserInterfaceScene';

export default abstract class Scenes {
  static ALL = [
    MainMenuScene.SCENE,
    LevelScene.SCENE,
    SideUserInterfaceScene.SCENE,
    GridUserInterfaceScene.SCENE
  ];
}
