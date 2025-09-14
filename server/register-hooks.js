import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

const messageChannel = new MessageChannel();

export const importMapPort = messageChannel.port1;

register(import.meta.resolve("@node-loader/import-maps"), {
  data: {
    // optional, provides a way to update the import map later on
    port: messageChannel.port2,
  },
  transferList: [messageChannel.port2],
});
