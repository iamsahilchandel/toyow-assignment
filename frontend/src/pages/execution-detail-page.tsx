import { useParams } from "react-router-dom";

export function ExecutionDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Execution Detail: {id}</h1>
      <p className="text-gray-500 mt-2">
        Execution details with live logs coming soon...
      </p>
    </div>
  );
}
