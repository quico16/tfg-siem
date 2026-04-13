export default function CompanySelector({ companies, selectedCompanyId, onChange }) {
  const safeCompanies = Array.isArray(companies) ? companies : []
  return (
    <select value={selectedCompanyId || 'ALL'} onChange={(e) => onChange(e.target.value)}>
      <option value="ALL">Totes les empreses</option>
      {safeCompanies.map((company) => (
        <option key={company.id} value={String(company.id)}>
          {company.name}
        </option>
      ))}
    </select>
  )
}
