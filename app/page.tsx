import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Blueprint Generator</h1>
      <p>Select a blueprint to get started:</p>
      <ul>
        <li>
          <Link href='/blueprints/demo'>Demo Blueprint</Link>
        </li>
      </ul>
    </main>
  )
}
