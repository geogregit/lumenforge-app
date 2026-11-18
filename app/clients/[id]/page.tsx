import ClientDetail from '@/components/ClientDetail'

export const instant = false

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClientDetail id={id} />
}
