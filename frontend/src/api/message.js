import api from "./api";

// shared
export const getMyConversations = () => api.get("/messages/conversations");
export const getMessages = (conversationId) =>
  api.get(`/messages/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, data) =>
  api.post(`/messages/conversations/${conversationId}/messages`, data); // { text, relatedOrder? }
export const deleteMessage = (messageId) =>
  api.delete(`/messages/messages/${messageId}`);
export const deleteConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}`);

// customer
export const openFarmerThread = (farmId) =>
  api.post(`/messages/conversations/farmer/${farmId}`);

// customer / farmer
export const openAdminThread = () => api.post("/messages/conversations/admin");
export const reportConversation = (conversationId, reason) =>
  api.post(`/messages/conversations/${conversationId}/report`, { reason });

// admin
export const getReportedConversations = () =>
  api.get("/messages/admin/reported");
export const setConversationBlock = (conversationId, blocked) =>
  api.patch(`/messages/admin/conversations/${conversationId}/block`, {
    blocked,
  });
export const clearConversationReport = (conversationId) =>
  api.patch(`/messages/admin/conversations/${conversationId}/clear-report`);
