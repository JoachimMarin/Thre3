export default class Direction {
  private readonly angle: integer;
  private readonly name: string;

  private constructor(angle: integer, name: string) {
    this.angle = angle;
    this.name = name;
  }

  ToAngle() {
    return this.angle;
  }

  toString() {
    return this.name;
  }

  static readonly RIGHT = new Direction(0, 'RIGHT');
  static readonly UP = new Direction(270, 'UP');
  static readonly LEFT = new Direction(180, 'LEFT');
  static readonly DOWN = new Direction(90, 'DOWN');

  static readonly ALL = [
    Direction.RIGHT,
    Direction.DOWN,
    Direction.LEFT,
    Direction.UP
  ];
}
