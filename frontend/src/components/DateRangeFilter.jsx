export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <div>
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
  )
}