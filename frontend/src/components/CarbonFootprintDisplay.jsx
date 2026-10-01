import { useCarbonFootprint } from "react-carbon-footprint";

const CarbonFootprintDisplay = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();

  return (
    <div className="bg-base-100 border border-theme-light rounded-box p-6">
      <h3 className="text-lg font-bold mb-3">Network Carbon Footprint</h3>
      <div className="space-y-1.5 text-sm">
        <p className="text-muted">
          Bytes Transferred:{" "}
          <span className="font-semibold text-base-content">
            {bytesTransferred}
          </span>{" "}
          bytes
        </p>
        <p className="text-muted">
          CO2 Emissions:{" "}
          <span className="font-semibold text-primary">{gCO2.toFixed(2)}</span>{" "}
          grams CO2eq
        </p>
      </div>
      <p className="text-xs text-muted-light mt-3">
        (Estimates based on network data transfer during this session)
      </p>
    </div>
  );
};

export default CarbonFootprintDisplay;
