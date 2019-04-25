export enum FrameType {
  normal = 0,
  magic = 1,
  rare = 2,
  'unique' = 3,
  'gem' = 4,
  'currency' = 5,
  'divination card' = 6,
  'quest item' = 7,
  'prophecy' = 8,
  'relic' = 9,
}

export const ReverseFrameType = [
  'normal',
  'magic',
  'rare',
  'unique',
  'gem',
  'currency',
  'divination card',
  'quest item',
  'prophecy',
  'relic',
];

export const getRarityFromFrameType = (frame: FrameType) => {
  return ReverseFrameType[frame];
}