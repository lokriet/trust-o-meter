
export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O'
}

export interface Profile {
  initialized?: boolean;
  identificator: string;
  username?: string;
  avatarUrl?: string;
  gender?: Gender;
};
