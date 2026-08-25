import { randomInt } from 'node:crypto';
import { config } from './config';

export interface RegistrationData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function tenDigitNumber(): string {
  return String(randomInt(1_000_000_000, 10_000_000_000));
}

export function newRegistrationData(): RegistrationData {
  const username = tenDigitNumber();
  return {
    username,
    firstName: 'Michael',
    lastName: 'Tester',
    email: `michael+${username}@yopmail.com`,
    password: config.testPassword,
  };
}
