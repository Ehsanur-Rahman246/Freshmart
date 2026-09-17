const WalletSummary = ({ customer }) => (
  <>
    <div className="rounded-box bg-success-soft px-4 py-3 text-center min-w-27.5">
      <p className="text-xs text-muted">Points</p>
      <p className="text-lg font-bold text-success">
        <strong className="text-2xl">&#2547;</strong>{customer.pointsBalance}
      </p>
    </div>
    <div className="rounded-box bg-error-soft px-4 py-3 text-center min-w-27.5">
      <p className="text-xs text-muted">Debt</p>
      <p className="text-lg font-bold text-error">
        <strong className="text-2xl">-&#2547;</strong>{customer.debtBalance}
      </p>
    </div>
  </>
);

export default WalletSummary;