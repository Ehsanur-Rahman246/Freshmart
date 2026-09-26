import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import {
  sendMessage as sendMessageApi,
  openFarmerThread as openFarmerThreadApi,
  openAdminThread as openAdminThreadApi,
  getMyConversations,
  getMessages,
  reportConversation,
  deleteMessage as deleteMessageApi,
  deleteConversation as deleteConversationApi,
} from "../api/message";

export const useSendMessage = (conversationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sendMessageApi(conversationId, data),
    onSuccess: (response) => {
      queryClient.setQueryData(["messages", conversationId], (old) =>
        old ? [...old, response.data.message] : [response.data.message],
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useOpenFarmerThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (farmId) => openFarmerThreadApi(farmId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
};

export const useOpenAdminThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => openAdminThreadApi(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
};

export const useConversations = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await getMyConversations();
      return data.conversations;
    },
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", onNewMessage);
    return () => socket.off("message:new", onNewMessage);
  }, [socket, queryClient]);

  return query;
};

export const useConversationMessages = (conversationId) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data } = await getMessages(conversationId);
      return data.messages;
    },
    enabled: Boolean(conversationId),
    staleTime: 1000 * 15,
  });

  // Opening a thread marks it read server-side — reflect that in the
  // conversation list's unread badge right away instead of waiting on
  // the next unrelated invalidation.
  useEffect(() => {
    if (!conversationId || query.isFetching || !query.isSuccess) return;
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, query.isSuccess, query.isFetching]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const onNewMessage = async (message) => {
      if (message.conversation !== conversationId) return;

      queryClient.setQueryData(["messages", conversationId], (old) =>
        old ? [...old, message] : [message],
      );

      // thread is open — refetching hits GET /messages again, which marks
      // it read server-side; then refresh the list so its badge updates
      await queryClient.refetchQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", onNewMessage);
    return () => socket.off("message:new", onNewMessage);
  }, [socket, conversationId, queryClient]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const onMessageRead = (payload) => {
      if (payload.conversationId !== conversationId) return;
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    };

    socket.on("message:read", onMessageRead);
    return () => socket.off("message:read", onMessageRead);
  }, [socket, conversationId, queryClient]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const onMessageDeleted = (payload) => {
      if (payload.conversationId !== conversationId) return;
      queryClient.setQueryData(["messages", conversationId], (old) =>
        old ? old.filter((m) => m._id !== payload.messageId) : old,
      );
    };

    socket.on("message:deleted", onMessageDeleted);
    return () => socket.off("message:deleted", onMessageDeleted);
  }, [socket, conversationId, queryClient]);

  return query;
};

export const useReportConversation = () =>
  useMutation({
    mutationFn: ({ conversationId, reason }) =>
      reportConversation(conversationId, reason),
  });

export const useDeleteMessage = (conversationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => deleteMessageApi(messageId),
    onSuccess: (_res, messageId) => {
      queryClient.setQueryData(["messages", conversationId], (old) =>
        old ? old.filter((m) => m._id !== messageId) : old,
      );
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId) => deleteConversationApi(conversationId),
    onSuccess: (_res, conversationId) => {
      queryClient.setQueryData(["messages", conversationId], []);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
