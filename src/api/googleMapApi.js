export const findNearestStation = (lat, lng, map, callback) => {
  if (!window.google) {
    console.error("Google Maps APIが読み込まれていません");
    return;
  }

  const location = new window.google.maps.LatLng(lat, lng);
  const request = {
    location: location,
    rankBy: window.google.maps.places.RankBy.DISTANCE, // 距離順で結果を返す
    type: ["train_station"], // 鉄道駅を検索
  };

  const service = new window.google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      // 各駅の距離を計算し、最も近い駅を探す
      const nearestStation = results.reduce(
        (closest, station) => {
          const stationLocation = station.geometry.location;
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              location,
              stationLocation
            );

          // 現在の最短距離の駅と比較し、より近い駅があれば更新
          return distance < closest.distance ? { station, distance } : closest;
        },
        { station: null, distance: Infinity }
      );

      // 最も近い駅をコールバックで返す
      callback([nearestStation.station]);
    } else {
      console.error("Places APIのエラー:", status);
    }
  });
};
