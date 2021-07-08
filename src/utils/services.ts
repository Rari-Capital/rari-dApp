import axios from "axios";

export const fetchTokenAPIData = async (address: string) => {
  try {
    const url = `https://app.rari.capital/api/tokenData?address=${address}`;
    const data = await axios.get(url);
    return data;
  } catch (err) {
    return { data: undefined };
  }
};
