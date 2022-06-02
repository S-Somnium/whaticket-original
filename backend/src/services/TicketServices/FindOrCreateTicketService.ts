import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import { Message as WbotMessage } from "whatsapp-web.js";
import LoopQueuesService from "../QueueService/LoopQueueService";
import { SendMessage } from "../QueueService/LoopQueueService";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact,
  msg?: WbotMessage
): Promise<Ticket | undefined> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId
    }
  });

  // basicamente criar um novo tipo de status que seria "picking" para determinar que esta esperando por uma fila

  if (ticket) {
    await ticket.update({ unreadMessages });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId: whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id,
        whatsappId: whatsappId
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }
  
  if (!ticket) {
    const selectedQueue = await LoopQueuesService(msg, whatsappId); // queue start at id 1 not 0. so he returns 0 if not selected.
    if (!selectedQueue) {
      return undefined;
    }
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      queueId: selectedQueue
    });
  }

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
