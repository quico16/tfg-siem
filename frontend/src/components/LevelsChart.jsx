export default function LevelsChart({
  levels,
  selectedLevel,
  onLevelChange
}) {
  const safeLevels = Array.isArray(levels) ? levels : []

  const totalCount = safeLevels.reduce((acc, item) => acc + (item.count ?? 0), 0)

  const visibleLevels =
    selectedLevel === 'ALL'
      ? safeLevels
      : safeLevels.filter((item) => item.level === selectedLevel)

  return (
    <div className="card">
      <h3>Nivells de logs</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => onLevelChange('ALL')}>Tots</button>
        <button onClick={() => onLevelChange('INFO')}>INFO</button>
        <button onClick={() => onLevelChange('WARNING')}>WARNING</button>
        <button onClick={() => onLevelChange('CRITICAL')}>CRITICAL</button>
      </div>

      {selectedLevel === 'ALL' ? (
        <p style={{ marginBottom: '12px' }}>
          Total logs comptats: <strong>{totalCount}</strong>
        </p>
      ) : (
        <p style={{ marginBottom: '12px' }}>
          Filtre actiu: <strong>{selectedLevel}</strong>
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>Nivell</th>
            <th>Quantitat</th>
          </tr>
        </thead>
        <tbody>
          {visibleLevels.map((item) => (
            <tr key={item.level}>
              <td>{item.level}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}