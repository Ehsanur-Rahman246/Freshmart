import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import {
  markAnnouncementRead as markAnnouncementReadApi,
  deleteMyAnnouncement as deleteMyAnnouncementApi,
  getMyAnnouncements,
  getAnnouncementHistory,
  createAnnouncement as createAnnouncementApi,
  sendAdminEmail as sendAdminEmailApi,
  getEmailLog,
} from "../api/announcement";

export const useAnnouncements = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await getMyAnnouncements();
      return data.announcements;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onNewAnnouncement = () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    };

    socket.on("announcement:new", onNewAnnouncement);
    return () => socket.off("announcement:new", onNewAnnouncement);
  }, [socket, queryClient]);

  return query;
};

export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statusId) => markAnnouncementReadApi(statusId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
};

export const useDeleteMyAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statusId) => deleteMyAnnouncementApi(statusId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
};

export const useAnnouncementHistory = () =>
  useQuery({
    queryKey: ["announcements", "admin", "history"],
    queryFn: async () => (await getAnnouncementHistory()).data.announcements,
    staleTime: 1000 * 30,
  });

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createAnnouncementApi(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["announcements", "admin", "history"],
      }),
  });
};

export const useEmailLog = () =>
  useQuery({
    queryKey: ["announcements", "admin", "emailLog"],
    queryFn: async () => (await getEmailLog()).data.logs,
    staleTime: 1000 * 30,
  });

export const useSendAdminEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sendAdminEmailApi(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["announcements", "admin", "emailLog"],
      }),
  });
};
