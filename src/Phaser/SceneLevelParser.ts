import LevelParser from 'Headless/Level/Generation/AssetLoading/LevelParser';
import LevelScene from 'Phaser/LevelScene';

export default class SceneLevelParser extends LevelParser {
  private scenes: Phaser.Scene[];
  private levelScene: LevelScene;

  constructor(levelScene: LevelScene, additionalScenes: Phaser.Scene[]) {
    super();
    this.levelScene = levelScene;
    this.scenes = [levelScene as Phaser.Scene].concat(additionalScenes);
  }

  override RegisterAsset(key: string) {
    for (const scene of this.scenes) {
      scene.load.image(key, 'assets/' + key + '.png');
    }
  }

  override ReadXmlFile(key: string, path: string): void {
    this.levelScene.load.xml(key, path);
  }

  private XmlToObject(xml: Element) {
    const obj = {};
    obj['$'] = {};
    for (const attr of xml.attributes) {
      obj['$'][attr.nodeName] = attr.value;
    }
    if (xml.children.length == 0 && xml.innerHTML != '') {
      obj['_'] = xml.innerHTML;
    } else {
      for (const child of xml.children) {
        if (!(child.nodeName in obj)) {
          obj[child.nodeName] = [];
        }
        obj[child.nodeName].push(this.XmlToObject(child));
      }
    }
    return obj;
  }

  override GetXmlObject(key: string): object {
    const xml: XMLDocument = this.levelScene.cache.xml.get(key);
    const obj = {};
    for (const child of xml.children) {
      obj[child.nodeName] = this.XmlToObject(child);
    }
    return obj;
  }
}
