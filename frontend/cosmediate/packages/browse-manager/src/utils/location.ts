export const getUserLocation = (): Promise<{
  lat: number;
  lon: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("pos", pos);
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      }
    );
  });
};
