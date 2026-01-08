import { useParams } from "react-router-dom";

export function WorkflowDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Workflow Detail: {id}</h1>
      <p className="text-gray-500 mt-2">Workflow details coming soon...</p>
    </div>
  );
}
