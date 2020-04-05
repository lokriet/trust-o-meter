export const generateIdentificator = (): string => {
  const result = (Date.now() + Math.floor(Math.random() * 8000000000)).toString(36);
  console.log('generated identificator', result);
  return result;
};