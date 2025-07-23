import { BiBell } from "react-icons/bi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { deleteNotificationApi, getAllNotificationApi, updateNotificationStatusApi } from "./api/admin";
import { Button } from "./components/ui/button";
interface SectionsState {
  dashboard: boolean;
  client: boolean;
  inventory: boolean;
  invoice: boolean;
  expenses: boolean;
  settings: boolean;
}

const sectionLabels: Record<keyof SectionsState, string> = {
  dashboard: "Home",
  client: "Client Management",
  inventory: "Inventory",
  invoice: "Invoice and Quotes",
  expenses: "Expenses",
  settings: "Settings",
};

interface Notifications {
  id: string;
  title: string;
  message: string;
  description: string;
  status: string;
  createdAt: Date;
}

export default function Header({ title }: { title: SectionsState }) {
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [statusUnreadCount, setStatusUnreadCount] = useState(0);
  const activeSection = Object.entries(title).find(
    ([_, isActive]) => isActive,
  )?.[0] as keyof SectionsState;


  const deleteNotificationHandler = async (id: string) => {
    const response = await deleteNotificationApi(id);
    if (response?.status === 200) {
      getNotifications();
    }
  };


  const changeToReadHandler = async () => {
    notifications.forEach((notification) => {
      if (notification.status === "unread") {
        changeNotificationStatusHandler(notification.id);
      }
    });
  };

  const changeNotificationStatusHandler = async (
    id: string
  ) => {
    const response = await updateNotificationStatusApi(id); 
    if (response?.status === 200) {
      getNotifications()
  };
}

  async function getNotifications() {
    const response = await getAllNotificationApi();
    if (response && response.status === 200) {
      setNotifications(response.data.data);
      setStatusUnreadCount(
        response.data.data.filter(
          (notification: Notifications) => notification.status === "unread",
        ).length,
      );
    }
  }

  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <section className="flex w-full justify-between">
      <div>
        <p className="text-3xl font-medium capitalize">
          Billsoft - {sectionLabels[activeSection]}
        </p>
      </div>
      <div className="flex items-center gap-5 rounded-full bg-[#FAFAFA] p-3 px-5">
        <div className="flex items-center gap-2 rounded-full">
          <Popover onOpenChange={changeToReadHandler}>
            <PopoverTrigger className="flex cursor-pointer items-center">
              <BiBell size={24} color="#A3AED0" />
              {statusUnreadCount > 0 && <Badge>{statusUnreadCount}</Badge>}
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto bg-[#F0F8FF]"
            >
              <div className="flex flex-col gap-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col w-full justify-between rounded-md bg-white my-1 p-1 gap-2"
                  >
                    <p className="text-xs font-medium">{notification.title}</p>
                    <p className="text-xs">{notification.message}</p>
                    <div className="flex justify-end">
                      <Button className="p-1 px-2" onClick={() => deleteNotificationHandler(notification.id)}>Noted!</Button>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs">No Notifications</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  );
}
