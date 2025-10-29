
export enum AppStep {
  Welcome,
  Info,
  Recording,
  ThankYou,
}

export enum Gender {
  Male = 'Laki-laki',
  Female = 'Perempuan',
  Other = 'Lainnya',
}

export interface Demographics {
  name: string;
  age: number;
  gender: Gender;
}
