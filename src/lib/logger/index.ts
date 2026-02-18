import { sendMessage } from "../utils/chrome/message";

export abstract class Logger {
  static async log(message: string): Promise<void> {
    sendMessage("LOGGER", message);
  }
}