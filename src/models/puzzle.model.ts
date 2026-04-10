// Referencing `Puzzle` "eternagame.org/src/types/common-types.ts"
export interface Puzzle {
  id: string;
  created: string;
  title: string;
  body: string;
  folder: string;
  has3d: string;
  number_of_states: number;
  reward: string;
  rna_type: string;
  secstruct: string;
  type: string;
  uid: string;
  username: string;
  userpicture: string;
  'made-by-player': string;
  'made-for-lab': string | null;
  'next-puzzle': string;
  'num-cleared': string;
  'num-submissions': string;
  'solved-by-bot': string | null;
  rscript: string | null;
}
