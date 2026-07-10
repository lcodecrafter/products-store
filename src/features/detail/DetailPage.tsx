import { useParams } from 'react-router-dom'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <section>
      <h1>Product detail: {id}</h1>
    </section>
  )
}
