import React from "react";

const DepartureTimeDisplay = ({ departureTime }) => {
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">出発時刻</h2>
      <p className="text-black-600 text-2xl font-bold">
        {departureTime || "計算中..."}
      </p>
    </div>
  );
};

export default DepartureTimeDisplay;
