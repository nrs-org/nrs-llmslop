import { Entry, Impact, Relation, EntryProgress } from "@/generated/prisma";

interface EntryDetailsPageProps {
  params: { id: string };
}

interface EntryWithRelations extends Entry {
  progress: EntryProgress | null;
  impacts: Array<{ impact: Impact }>;
  relations: Array<{ relation: Relation }>;
  referencedBy: Array<{ relation: Relation }>;
}

export default async function EntryDetailsPage({ params }: EntryDetailsPageProps) {
  const { id } = params;

  const res = await fetch(`http://localhost:3000/api/entries/${id}`, {
    cache: "no-store",
  });
  const entry: EntryWithRelations = await res.json();

  if (!entry) {
    return <div className="container mx-auto p-4">Entry not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{entry.title}</h1>
      <p>ID: {entry.id}</p>
      {entry.bestGirl && <p>Best Girl: {entry.bestGirl}</p>}

      {entry.progress && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Progress</h2>
          <p>Status: {entry.progress.status}</p>
          {entry.progress.episode && <p>Episode: {entry.progress.episode}</p>}
          {entry.progress.length_seconds && (
            <p>Length (seconds): {entry.progress.length_seconds}</p>
          )}
        </div>
      )}

      {entry.additionalSources && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Additional Sources</h2>
          <pre className="bg-gray-100 p-2 rounded-md overflow-auto">
            {JSON.stringify(entry.additionalSources, null, 2)}
          </pre>
        </div>
      )}

      {entry.dah_meta && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">DAH Meta</h2>
          <pre className="bg-gray-100 p-2 rounded-md overflow-auto">
            {JSON.stringify(entry.dah_meta, null, 2)}
          </pre>
        </div>
      )}

      {entry.impacts && entry.impacts.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Impacts</h2>
          <ul>
            {entry.impacts.map((ic) => (
              <li key={ic.impact.id} className="mt-2">
                <p>Name: {ic.impact.name}</p>
                <p>Score Vector: {JSON.stringify(ic.impact.scoreVector)}</p>
                <p>Contributing Weight: {JSON.stringify(ic.contributingWeight)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.relations && entry.relations.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Relations</h2>
          <ul>
            {entry.relations.map((rc) => (
              <li key={rc.relation.id} className="mt-2">
                <p>Name: {rc.relation.name}</p>
                <p>Contributing Weight: {JSON.stringify(rc.contributingWeight)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}