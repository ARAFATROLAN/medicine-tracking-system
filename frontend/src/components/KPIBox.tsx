interface Props {
  title: string;
  value: string | number;
}

export default function KPIBox({ title, value }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
      <div className="text-gray-500 text-sm">
        {title}
      </div>
      <div className="text-3xl font-bold text-gray-800 mt-2">
        {value}
      </div>
    </div>
  );
}