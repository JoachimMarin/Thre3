export default class LaserColor {
  public readonly name: string;
  public readonly length: integer;

  static readonly ALL = new Set<LaserColor>();

  constructor(name: string, length: integer) {
    this.name = name;
    this.length = length;
    LaserColor.ALL.add(this);
  }

  static readonly GREEN = new LaserColor('green', 3);
  static readonly YELLOW = new LaserColor('yellow', 4);
  static readonly RED = new LaserColor('red', 5);
  static readonly BLUE = new LaserColor('blue', 7);
  static readonly PURPLE = new LaserColor('purple', 10);
}
