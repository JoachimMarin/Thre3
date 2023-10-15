export default class Direction {
  public readonly angle: integer;
  public readonly name: string;
  public readonly id: integer;

  private constructor(id: integer, name: string) {
    this.id = id;
    this.angle = id * 90;
    this.name = name;
  }

  toString() {
    return this.name;
  }

  static readonly RIGHT = new Direction(0, 'RIGHT');
  static readonly DOWN = new Direction(1, 'DOWN');
  static readonly LEFT = new Direction(2, 'LEFT');
  static readonly UP = new Direction(3, 'UP');

  static readonly ALL = [
    Direction.RIGHT,
    Direction.DOWN,
    Direction.LEFT,
    Direction.UP
  ];
}
