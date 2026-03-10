export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export interface Stroke {
  points: Point[];
  lengths: number[]; // cumulative distance at each point
  totalLength: number;
}
