import myDomain from "./mydomain";
import { v4 as uuidv4 } from "uuid";

export const getPoints = async () => {
  const anonIdGP = localStorage.getItem("anonIdGP");
  try {
    const res = await fetch(`${myDomain}/points/${anonIdGP}`, {
      method: "GET",
    });
    const pointsData = await res.json();
    if (res.status === 200) {
      // localStorage.setItem("pointGP", pointsData.point);
      return pointsData.point;
    } else {
      console.error("Failed to fetch points. Status:", res.status);
    }
  } catch (err) {
    console.error("Error fetching points:", err);
  }
};

export const getLevels = async () => {
  const anonIdGP = localStorage.getItem("anonIdGP");
  try {
    const res = await fetch(`${myDomain}/levels/${anonIdGP}`, {
      method: "GET",
    });
    const levelsData = await res.json();
    if (res.status === 200) {
      return levelsData.level;
    } else {
      console.error("Failed to fetch levels. Status:", res.status);
    }
  } catch (err) {
    console.error("Error fetching levels:", err);
  }
};

export const signupOrLogin = async () => {
  const anonIdGP = uuidv4();
  try {
    const res = await fetch(`${myDomain}/autoSignup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonId: anonIdGP, point: 0, level: 0 }),
    });
    if (res.status === 200 || res.status === 201) {
      localStorage.setItem("anonIdGP", anonIdGP);
    }
  } catch (err) {
    console.error("Error generating UUID:", err);
  }
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
