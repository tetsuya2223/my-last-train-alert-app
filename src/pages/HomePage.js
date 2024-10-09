import React, { useState, useEffect } from "react";
import useGeolocation from "../hooks/useGeolcation";
import { findNearestStation } from "../api/googleMapApi";
import PlacesAutocomplete from "react-places-autocomplete";

const HomePage = () => {
  const [station, setStation] = useState("");
  const [walkingTime, setWalkingTime] = useState(null);
  const [departureTime, setDepartureTime] = useState(null);
  const [location, setLocation] = useState(null); // 位置情報を保存するステート
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を管理
  const [nearestStation, setNearestStation] = useState(null);
  const [stationName, setStationName] = useState(null);
  const [address, setAddress] = useState(""); // ユーザーが入力する駅名（住所）
  const [selectedStation, setSelectedStation] = useState(null); // ユーザーが選んだ駅名
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // Google Maps APIの読み込み状態

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const loadGoogleMapsScript = () => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  };

  useEffect(() => {
    loadGoogleMapsScript(); // コンポーネントマウント時にGoogle Maps APIを読み込む
  }, []);

  // 最寄り駅入力の処理
  const handleStationChange = (e) => {
    setStation(e.target.value);
  };

  const handleSelect = async (value) => {
    setAddress(value);
    setSelectedStation(value);
  };

  const getWalkingTime = (location, nearestStation) => {
    if (location && nearestStation) {
      const service = new window.google.maps.DistanceMatrixService();
      const request = {
        origins: [new window.google.maps.LatLng(location.lat, location.lng)],
        destinations: [
          new window.google.maps.LatLng(nearestStation.lat, nearestStation.lng),
        ],
        travelMode: window.google.maps.TravelMode.WALKING,
      };

      service.getDistanceMatrix(request, (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          const result = response.rows[0].elements[0];
          if (result.status === "OK") {
            setWalkingTime(result.duration.text); // 所要時間を更新
            console.log("徒歩時間:", result.duration.text);
          } else {
            console.error("徒歩時間の取得に失敗しました");
          }
        } else {
          console.error("Distance Matrix APIのエラー:", status);
        }
      });
    }
  };

  useEffect(() => {
    if (location && nearestStation) {
      getWalkingTime(location, nearestStation);
    }
  }, [location, nearestStation]);

  // 現在地取得ボタンがクリックされたときに実行
  const handleGetLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          setLocation({ lat: latitude, lng: longitude });
          console.log("現在地取得成功:", latitude, longitude);
          setIsLoading(false);

          // ここで最寄り駅を検索
          const map = new window.google.maps.Map(document.createElement("div")); // ダミーの地図オブジェクト
          findNearestStation(latitude, longitude, map, (results) => {
            if (results.length > 0) {
              const nearestStationName = results[0].name; // 駅名を取得
              setStationName(nearestStationName); // 駅名を保存
              console.log("最寄り駅:", nearestStationName);

              const nearest = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };
              setNearestStation(nearest); // 緯度・経度を保存
              console.log("最寄り駅の座標:", nearest);
              getWalkingTime(currentLocation, nearestStation); // 現在地取得後に徒歩時間を計算
            }
          });
        },
        (error) => {
          console.error("位置情報の取得に失敗しました", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation APIがサポートされていません");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      {/* ヘッダー */}
      <header className="w-full bg-blue-600 text-white text-center py-4">
        <h1 className="text-2xl font-bold">LastTrainAlert</h1>
        <p className="text-sm">終電までに帰るためのサポートアプリ</p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        ) : (
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-10"
            onClick={handleGetLocation}
          >
            現在地を取得する
          </button>
        )}
        {/* 最寄り駅入力フォーム */}
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
                setAddress(value);
                setSelectedStation(value);
                // 他に必要な処理があればここに追加
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
                      onKeyDown: handleKeyDown,
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
                          <span>{suggestion.description}</span>
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

          {/* 「駅を設定」ボタン */}

          {/* 選択された駅名の表示 */}
          {station && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">設定された駅: {station}</h3>
            </div>
          )}
        </div>

        {/* 徒歩時間表示 */}
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">
            現在地から最寄り駅までの徒歩時間
          </h2>
          <h2 className="text-lg font-semibold mb-4">
            現在地からの最寄駅: {stationName || "未設定"}
          </h2>
          {/* ここに徒歩時間の結果を表示 */}
          {walkingTime ? (
            <p className="text-green-600 text-xl font-bold">{walkingTime}</p>
          ) : (
            <p className="text-gray-500">徒歩時間を計算中...</p>
          )}
        </div>

        {/* 出発時刻の表示 */}
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">出発時刻</h2>
          {/* ここに出発時間を表示 */}
          <p className="text-red-600 text-2xl font-bold"></p>
          <p className="text-gray-500">出発時刻を計算中...</p>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-gray-800 text-white text-center py-4">
        <p className="text-xs">© 2024 LastTrainAlert</p>
      </footer>
    </div>
  );
};

export default HomePage;
