import { meaningfulHandler } from "../../../src/handlers/shared/handler";
import { getLogger } from "../../../src/bindings";

jest.mock("../../../src/bindings");

describe("meaningfulHandler", () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
    };
    (getLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  it("logs a message indicating that it's running", async () => {
    await meaningfulHandler();
    expect(mockLogger.debug).toHaveBeenCalledWith(`Running handler, name: ${meaningfulHandler.name}`);
  });

  it("handles error when logger function throws an error", async () => {
    mockLogger.debug.mockImplementation(() => {
      throw new Error("Logger error");
    });

    try {
      await meaningfulHandler();
    } catch (error) {
      expect(error).toEqual(new Error("Logger error"));
    }
  });
});
