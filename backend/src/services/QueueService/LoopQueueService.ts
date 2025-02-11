import ListQueuesService from "./ListQueuesService";
import { Message as WbotMessage } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";

const LoopQueuesService = async (
  msg: WbotMessage | undefined,
  whatsappId: number
): Promise<number> => {
  console.log("recebi mensagem");
  if (msg?.id.fromMe) return 0;
  const queues = await ListQueuesService();
  //@ts-ignore
  let selected = parseInt(msg?.body.charAt(0));
  let message =
    "Olá! Bem vindo a Imperio Tecnologia por favor escolha uma das seguintes opções.\n\n";
  for (let x in queues) {
    let temp = parseInt(x) + 1;
    //@ts-ignore
    message += temp + " - " + queues[x].dataValues.name + "\n";
  }
  if (isNaN(selected)) {
    await SendMessage(msg, whatsappId, message);
    return 0;
  }
  for (let x in queues) {
    if (parseInt(x) == selected - 1) {
      SendMessage(
        msg,
        whatsappId, //@ts-ignore

        `Você acaba de ser redericionado para a fila ${queues[x].dataValues.name}, você será atendido assim que um dos nossos colaboradores estiver disponivel, por favor aguarde! Obrigado.`
      );
      //@ts-ignore
      //ok
      return queues[x].dataValues.id;
    }
  }

  await SendMessage(msg, whatsappId, message);
  return 0;
};

export default LoopQueuesService;

const SendMessage = async (
  msg: WbotMessage | undefined,
  whatsappId: number,
  message: string
) => {
  const wbot = await getWbot(whatsappId);
  try {
    await wbot.sendMessage(`${msg?.from}`, message);
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export { SendMessage };
