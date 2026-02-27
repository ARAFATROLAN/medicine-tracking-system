import React from "react";

interface CardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="flex items-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
      <div className={`p-4 rounded-full text-white ${color} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Card;