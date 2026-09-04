import { getOrCreateConversation } from "../sideBar/apiConversation";

export async function getConvInfoById({ friendUserId }) {
  const conversation = await getOrCreateConversation(friendUserId);
  return {
    ...conversation,
    friendInfo: {
      ...conversation.peer,
      fullname: conversation.peer?.display_name,
    },
  };
}
