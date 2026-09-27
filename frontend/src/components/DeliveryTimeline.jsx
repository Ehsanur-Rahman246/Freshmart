const STEPS = [
  { key: "readyForPickup", label: "Ready" },
  { key: "pickedUp", label: "Picked Up" },
  { key: "toOriginCenter", label: "To Origin" },
  { key: "inTransit", label: "In Transit" },
  { key: "toDestinationCenter", label: "To Destination" },
  { key: "outForDelivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const DeliveryTimeline = ({ status }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ul className="steps steps-horizontal w-full text-[11px] sm:text-xs">
      {STEPS.map((step, index) => (
        <li
          key={step.key}
          className={`step ${index <= currentIndex ? "step-primary" : ""}`}
        >
          {step.label}
        </li>
      ))}
    </ul>
  );
};

export default DeliveryTimeline;