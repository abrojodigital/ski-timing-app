import * as Location from 'expo-location';

export const formatTimestamp = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '--:--:--:----';

  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);
  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
};


// Esta función sincroniza la hora del dispositivo con un reloj mundial
// utilizando la API de WorldTimeAPI. Si falla, devuelve la hora actual del dispositivo.
// Pero no la uso
export const syncTimeWithWorldClock = async (): Promise<Date> => {
  try {
    const res = await fetch('http://worldtimeapi.org/api/ip');
    const data = await res.json();
    return new Date(data.utc_datetime);
  } catch {
    return new Date(); // fallback
  }
};

// Funcion que sincroniza la hora del dispositivo con la ubicación GPS
// Esta función obtiene la ubicación actual del dispositivo y utiliza la API de WorldTimeAPI
export const syncTimeWithGPS = async (): Promise<Date> => {
  try {
    // Pedir permisos
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Permiso denegado');

    // Obtener ubicación actual
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Obtener hora UTC
    const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
    const data = await res.json();
    const utcDate = new Date(data.utc_datetime);

    // Obtener zona horaria local del dispositivo (en base a GPS)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Obtener la diferencia horaria del dispositivo
    const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone }));
    return localDate;
  } catch (e) {
    console.error('Error al sincronizar con GPS', e);
    return new Date(); // fallback
  }
};

export const syncTimeWithGPSFallback = async (): Promise<Date> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Permiso denegado');

    const location = await Location.getCurrentPositionAsync({});
    const longitude = location.coords.longitude;

    // Hora UTC actual local del dispositivo sin zona horaria (offset 0)
    // Usamos Date.UTC para obtener tiempo UTC sin zona local.
    const now = new Date();

    // Calcular offset en milisegundos
    const offsetHours = longitude / 15;
    const offsetMillis = offsetHours * 60 * 60 * 1000;

    // Estimar hora local sumando offset a UTC local
    // Ajustamos ahora sumando el offset al tiempo UTC local
    const estimatedLocalTime = new Date(now.getTime() + offsetMillis);

    return estimatedLocalTime;
  } catch (e) {
    console.error('Error en fallback de hora GPS:', e);
    return new Date(); // fallback a hora local del sistema
  }
};