// src/components/StationInput.js
import React from "react";
import PlacesAutocomplete from "react-places-autocomplete";

const StationInput = ({
  address,
  setAddress,
  setSelectedStation,
  isScriptLoaded,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const extractStationName = (description) => {
    // 文字列を反転
    const reversedDescription = description.split("").reverse().join("");
    // 最初の空白のインデックスを取得
    const firstSpaceIndex = reversedDescription.indexOf(" ");

    // 空白が見つかった場合、その後ろの部分を取得
    if (firstSpaceIndex !== -1) {
      const stationName = reversedDescription
        .substring(0, firstSpaceIndex)
        .split("")
        .reverse()
        .join("");
      return stationName.trim(); // 駅名を返す
    }

    return description; // 空白がなければ元の文字列を返す
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        自宅の最寄り駅を入力してください
      </h2>

      {isScriptLoaded ? (
        <PlacesAutocomplete
          value={address}
          onChange={(value) => {
            setAddress(value);
            setSelectedStation(null); // 駅が選ばれた時に選択をクリア
          }}
          onSelect={(value) => {
            const stationName = extractStationName(value);
            setAddress(stationName);
            setSelectedStation(stationName);
            console.log("選択された駅名:", stationName);
          }}
          searchOptions={{ types: ["train_station"] }} // 駅名のみを対象に検索
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => (
            <div>
              {/* 駅名を入力するインプットボックス */}
              <input
                {...getInputProps({
                  placeholder: "駅名を入力",
                  className:
                    "w-full p-2 border border-gray-300 rounded-lg mb-4",
                  onKeyDown: (e) => {
                    handleKeyDown(e); // ここでエンターキーの動作をキャンセル
                  },
                })}
              />

              <div>
                {/* ローディング中の表示 */}
                {loading && <div>候補を読み込み中...</div>}

                {/* サジェストリストの表示 */}
                {suggestions.map((suggestion, index) => {
                  const className = suggestion.active
                    ? "suggestion-item--active"
                    : "suggestion-item";

                  // 各サジェストのスタイル設定
                  return (
                    <div
                      key={suggestion.placeId || index}
                      {...getSuggestionItemProps(suggestion, {
                        className,
                        style: {
                          backgroundColor: suggestion.active
                            ? "#fafafa"
                            : "#ffffff",
                          cursor: "pointer",
                          padding: "10px", // 各候補にパディングを設定
                          borderBottom: "1px solid #ccc", // 下に境界線を追加
                          whiteSpace: "nowrap", // 1行に表示
                          overflow: "hidden", // 長すぎるテキストを隠す
                          textOverflow: "ellipsis", // 省略記号を追加
                        },
                      })}
                    >
                      {/* 駅名の候補 */}
                      <span>{extractStationName(suggestion.description)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      ) : (
        <div>読み込み中...</div>
      )}
    </div>
  );
};

export default StationInput;
