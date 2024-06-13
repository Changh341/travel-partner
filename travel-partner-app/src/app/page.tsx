export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const staticData = await fetch(`${apiUrl}/api/attractions`);

  if (!staticData) {
    <div>Not loaded</div>;
  }

  const data = await staticData.json();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Loaded</div>
      <div>
        {data.map((attr) => {
          return (
            <div key={attr.name}>
              {attr.name}
              {attr.type}
            </div>
          );
        })}
      </div>
    </main>
  );
}
