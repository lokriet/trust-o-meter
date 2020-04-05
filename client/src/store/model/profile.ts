
export enum Gender {
  M = 'He',
  F = 'She',
  T = 'Them'
}

export interface Profile {
  _id: any;
  ownerId: string;
  identificator: string;
  username: string;
  avatarUrl: string | null;
  gender: Gender;
};
