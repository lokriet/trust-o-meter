export const urlBase64ToUint8Array = (base64String) => {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);

  // eslint-disable-next-line
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const generateIdentificator = (): string => {
  const result = (Date.now() + Math.floor(Math.random() * 8000000000)).toString(36);
  return result;
};