export default function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div>
      <p>{message}</p>
    </div>
  )
}