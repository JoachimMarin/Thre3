import ByteArray from 'Utils/Math/ByteArray';

export default abstract class GridObjectChanges {
  static GetByteArraySize() {
    return 4;
  }

  static WriteByteArray(
    byteArray: Uint8Array,
    index: integer,
    changes: integer
  ) {
    return ByteArray.Write32(byteArray, index, changes);
  }

  static SetFlag(changes: integer, index: integer, flag: boolean) {
    if (flag) {
      return changes | (1 << index);
    } else {
      return changes & ~(1 << index);
    }
  }

  static GetFlag(changes: integer, index: integer) {
    return (changes & (1 << index)) != 0;
  }
}
