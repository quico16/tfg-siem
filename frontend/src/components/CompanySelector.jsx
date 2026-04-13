export default function CompanySelector({ companies, selectedCompanyIds, onChange }) {
  const safeCompanies = Array.isArray(companies) ? companies : []
  const selectedIds = Array.isArray(selectedCompanyIds) ? selectedCompanyIds : []
  const allIds = safeCompanies.map((company) => String(company.id))
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id))

  const handleToggleAll = (checked) => {
    onChange(checked ? allIds : [])
  }

  const handleToggleCompany = (companyId, checked) => {
    if (checked) {
      onChange([...new Set([...selectedIds, companyId])])
      return
    }

    onChange(selectedIds.filter((id) => id !== companyId))
  }

  return (
    <div style={{ minWidth: '240px' }}>
      <p style={{ margin: '0 0 8px 0' }}>
        <strong>Empreses</strong>
      </p>

      <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => handleToggleAll(e.target.checked)}
        />
        Totes les empreses
      </label>

      <div
        style={{
          border: '1px solid #d5d5d5',
          borderRadius: '8px',
          padding: '8px',
          maxHeight: '180px',
          overflowY: 'auto',
          minWidth: '220px'
        }}
      >
        {safeCompanies.map((company) => {
          const companyId = String(company.id)

          return (
            <label
              key={company.id}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(companyId)}
                onChange={(e) => handleToggleCompany(companyId, e.target.checked)}
              />
              {company.name}
            </label>
          )
        })}
      </div>
    </div>
  )
}
