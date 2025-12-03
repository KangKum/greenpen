import { useState } from "react";
import { getPoints } from "../util/functions";
import { useSetAtom } from "jotai";
import { pointAtom } from "../atoms/pointAtom";
import { colors, txtColors } from "../util/color";
import AlertForm from "../components/AlertForm";
import myDomain from "../util/mydomain";
import LoadingSpinner from "../components/LoadingSpinner";
import { delay } from "../util/functions";

const Writing = () => {
  const [worryLetter, setWorryLetter] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const setPoint = useSetAtom(pointAtom);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTxt, setAlertTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitWorryLetter = async () => {
    const anonIdGP = localStorage.getItem("anonIdGP");
    if (worryLetter.trim() === "") return;
    setIsLoading(true);
    await delay(800); // 800ms가 보통 적당함

    //서버로 worryLetter 전송
    try {
      const res = await fetch(`${myDomain}/writing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonId: anonIdGP, letter: worryLetter, writtenDate: new Date().toISOString(), attention: [], colorIndex }),
      });
      const data = await res.json();

      if (res.status === 201) {
        const newPoint = await getPoints();
        setPoint(newPoint);
        setWorryLetter("");
        setAlertTxt("성공적으로 털어놓았습니다.");
      } else if (res.status === 500) {
        setAlertTxt(data.error);
      } else if (res.status === 429) {
        setAlertTxt(data.error);
      } else if (res.status === 400) {
        setAlertTxt(data.error);
      } else if (res.status === 403) {
        setAlertTxt(data.error);
        setColorIndex(0);
      } else {
        setAlertTxt("예기치 못한 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setShowAlertForm(true);
    } catch (err) {
      console.error("Error submitting worry letter:", err);
      setAlertTxt("성공적으로 털어놓았습니다.");
      setShowAlertForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <LoadingSpinner />
  ) : showAlertForm ? (
    <AlertForm alertTxt={alertTxt} setShowAlertForm={setShowAlertForm} />
  ) : (
    <div className="w-full h-full flex justify-center md:items-center">
      <div className="w-full h-[70%] pt-[25%] md:pt-0 md:w-[50%] md:h-[70%] md:min-w-[800px] md:min-h-[400px] flex flex-col justify-center items-center">
        {colorIndex !== 0 ? (
          <div className="h-8 mb-2 text-black/30 beigeColor px-2 py-1 rounded-2xl">색지는 100포인트가 필요합니다</div>
        ) : (
          <div className="blankSpace h-8 mb-2 text-black/30 beigeColor px-2 py-1 rounded-2xl"></div>
        )}
        <div className="upPart flex w-[90%] h-[80%] ml-40 mr-32">
          <textarea
            spellCheck={false}
            value={worryLetter}
            onChange={(e) => setWorryLetter(e.target.value)}
            style={{ backgroundColor: colors[colorIndex], color: txtColors[colorIndex] }}
            className="rounded-xl shadow-lg w-[94%] h-full p-4"
          ></textarea>
          <div className="hidden md:w-[6%] md:h-full md:flex md:justify-center">
            <button
              className="letterContainer rounded-full shadow-lg w-8 h-8 mt-1"
              style={{ backgroundColor: colors[colorIndex] }}
              onClick={() => {
                setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
              }}
            ></button>
          </div>
        </div>
        <div className="downPart w-[90%] h-[20%] mx-auto flex justify-center items-center">
          <div className="blankSpace w-[30%] h-full"></div>
          <div className="w-[40%] h-full flex justify-center items-center">
            <button
              className={`w-18 h-8 text-sm md:w-20 md:h-10 md:text-base rounded-xl text-gray-500 hover:text-gray-700 beigeColor2 shadow active:translate-y-0.5 transition-transform duration-100`}
              onClick={() => submitWorryLetter()}
            >
              털어놓기
            </button>
          </div>
          <div className="w-[30%] h-full flex justify-end items-center">
            <button
              className="md:hidden letterContainer rounded-full shadow-lg w-7 h-7 mr-3"
              style={{ backgroundColor: colors[colorIndex] }}
              onClick={() => {
                setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
              }}
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Writing;
