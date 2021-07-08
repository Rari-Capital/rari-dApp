import axios from "axios";

export const fetchTokenAPIData = async (address: string) => {
  const url = `https://app.rari.capital/api/tokenData?address=${address}`;
  const data = await axios.get(url);
  return data;
};
