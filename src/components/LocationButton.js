import React from "react";

const LocationButton = ({ isLoading, onClick }) => {
  return (
    <button
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-10"
      onClick={onClick}
    >
      {isLoading ? "ローディング中..." : "現在地を取得する"}
    </button>
  );
};

export default LocationButton;
