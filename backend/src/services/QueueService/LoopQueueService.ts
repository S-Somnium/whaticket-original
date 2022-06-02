import ListQueuesService from "./ListQueuesService";
import {
  Message as WbotMessage,
} from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";

const LoopQueuesService = async (  msg: WbotMessage | undefined, whatsappId: number  ): Promise<number> => {
  if(msg?.id.fromMe)return 0
  const queues = await ListQueuesService()
      //@ts-ignore
  let selected = parseInt(msg?.body.charAt(0))
  let message = "Olá! Bem vindo a Imperio Tecnologia por favor escolha uma das seguintes opções.\n\n"
  for(let x in queues){
    //@ts-ignore
    message += queues[x].dataValues.id + " - para fila do "+ queues[x].dataValues.name+"\n"
  }
  if(isNaN(selected)){
    await SendMessage(msg,whatsappId,message)
    return 0
  }
  for(let x in queues){
    //@ts-ignore
    if(queues[x].dataValues.id === selected){
          //@ts-ignore

      SendMessage(msg,whatsappId,`Você acaba de ser redericionado para a fila ${queues[x].dataValues.name}, embreve iremos lhe atender, por favor aguarde! Obrigado.`)
      return selected
    }
  }

    await SendMessage(msg,whatsappId,message)
  return 0
};
  
export default LoopQueuesService

const SendMessage = async (msg: WbotMessage  | undefined, whatsappId: number,message: string) =>{
    const wbot = await getWbot(whatsappId);
    try {
     await wbot.sendMessage(
        `${msg?.from}`,
        message
      );
    } catch (err) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
}

export {SendMessage}


