import { getServer } from "./main.test";

export function breakDownTests(): jest.ProvidesHookCallback {
  return async () => {
    await getServer().stop();
  };
}
