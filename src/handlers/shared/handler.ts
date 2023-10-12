import { getLogger } from "../../bindings";
import { ActionHandler } from "../../types";

export const meaningfulHandler: ActionHandler = async (): Promise<void> => {
  // This handler logs a message indicating that it's running

  const logger = getLogger();
  logger.debug(`Running handler, name: ${meaningfulHandler.name}`);
};
