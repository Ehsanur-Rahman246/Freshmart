export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// viewerRole: "customer" | "farmer" | "admin"
export const getConversationDisplay = (conversation, viewerRole) => {
  if (conversation.type === "userAdmin") {
    if (viewerRole === "admin") {
      return {
        title: conversation.user?.name || "User",
        subtitle: conversation.user?.role
          ? conversation.user.role[0].toUpperCase() +
            conversation.user.role.slice(1)
          : "",
        avatarSrc: null,
      };
    }
    return {
      title: "FreshMart Support",
      subtitle: "Admin",
      avatarSrc: null,
    };
  }

  // customerFarmer
  if (viewerRole === "farmer") {
    return {
      title: conversation.customer?.user?.name || "Customer",
      subtitle: "Customer",
      avatarSrc: conversation.customer?.profileImage?.url || null,
    };
  }

  return {
    title: conversation.farmer?.user?.name || "Farmer",
    subtitle: "Farmer",
    avatarSrc: conversation.farmer?.profileImage?.url || null,
  };
};
