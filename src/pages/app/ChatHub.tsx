import { useMemo } from "react";
import { getStoredUser } from "@/lib/api";
import CariBidan from "./CariBidan";
import ChatInbox from "./ChatInbox";

const ChatHub = () => {
  const user = useMemo(() => getStoredUser(), []);
  if (user?.role === "midwife" || user?.role === "admin") return <ChatInbox />;
  return <CariBidan />;
};

export default ChatHub;
