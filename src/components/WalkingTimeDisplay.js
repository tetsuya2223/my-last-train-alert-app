import React from "react";

const WalkingTimeDisplay = ({ walkingTime, stationName }) => {
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">
        現在地からの最寄駅: {stationName || "未設定"}
      </h2>
      <h2 className="text-lg font-semibold mb-4">
        現在地から最寄り駅までの徒歩時間
      </h2>

      {walkingTime ? (
        <p className="text-green-600 text-xl font-bold">{walkingTime}</p>
      ) : (
        <p className="text-gray-500">徒歩時間を計算中...</p>
      )}
    </div>
  );
};

export default WalkingTimeDisplay;
