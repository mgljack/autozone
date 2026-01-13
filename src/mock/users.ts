export type MockUser = {
  id: string; // login id
  password: string;
  name: string;
};

export const users: MockUser[] = [
  { id: "demo", password: "demo1234", name: "Demo User" },
  { id: "oogii", password: "test1234", name: "Oogii" },
];

export const phoneLogin = {
  otp: "123456",
} as const;


