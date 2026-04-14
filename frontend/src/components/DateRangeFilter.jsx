export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <div>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
  )
}
