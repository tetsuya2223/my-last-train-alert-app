import React, { useState, useEffect } from "react";

const loadGoogleMapsScript = (setIsScriptLoaded) => {
  if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps APIが読み込まれました");
      setIsScriptLoaded(true); // スクリプト読み込み完了時に状態を更新
    };
    script.onerror = () => {
      console.error("Google Maps APIの読み込みに失敗しました");
      setIsScriptLoaded(false); // 読み込み失敗時に状態を更新
    };
    document.body.appendChild(script);
  } else {
    console.log("Google Maps APIはすでに読み込まれています");
    setIsScriptLoaded(true); // すでにスクリプトが存在する場合も状態を更新
  }
};

const GoogleMapComponent = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // スクリプトの読み込み状態を管理

  useEffect(() => {
    loadGoogleMapsScript(setIsScriptLoaded);
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.google && window.google.maps) {
      // Google Maps APIが読み込まれた後に実行される処理
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      console.log("Google Mapsが初期化されました");
    }
  }, [isScriptLoaded]);

  return (
    <div>
      <h1>Google Maps</h1>
      <div id="map" style={{ width: "100%", height: "400px" }}></div>
      {!isScriptLoaded && <p>Google Mapsを読み込んでいます...</p>}
    </div>
  );
};

export default GoogleMapComponent;
