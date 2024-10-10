import React, { useState, useEffect } from "react";
import { findNearestStation } from "../api/googleMapApi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LocationButton from "../components/LocationButton";
import WalkingTimeDisplay from "../components/WalkingTimeDisplay";
import DepartureTimeDisplay from "../components/DepartureTimeDisplay";
import StationInput from "../components/StationInput";
import IsLoading from "../components/IsLoading";

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
  const [error, setError] = useState(null); // エラー状態を追加

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const loadGoogleMapsScript = () => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry`;
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
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <IsLoading />
        ) : (
          <LocationButton isLoading={isLoading} onClick={handleGetLocation} />
        )}
        <StationInput
          address={address}
          setAddress={setAddress}
          setSelectedStation={setSelectedStation}
          isScriptLoaded={isScriptLoaded}
        />
        <WalkingTimeDisplay
          walkingTime={walkingTime}
          stationName={stationName}
        />
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">終電時刻</h2>
          <p className="text-black-600 text-2xl font-bold">計算中...</p>
        </div>

        <DepartureTimeDisplay departureTime={departureTime} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
