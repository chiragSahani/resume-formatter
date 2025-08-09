import CVPreview from "@/components/CVPreview";
import { CVData } from "@/types/cv";

async function getCvData(id: string): Promise<CVData | null> {
  try {
    // This fetch call runs on the server, so we need the full URL to the Express backend
    const res = await fetch(`http://localhost:5000/api/cv/${id}`);
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch CV data from Express backend:", error);
    return null;
  }
}

export default async function CVPage({ params }: { params: { id: string } }) {
  const cvData = await getCvData(params.id);

  if (!cvData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">CV Not Found</h1>
        <p className="text-slate-600">
          The CV you are looking for does not exist.
        </p>
      </div>
    );
  }

  return <CVPreview cvData={cvData} />;
}
