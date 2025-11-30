import { getPoints, getLevels } from "../util/functions";
import { pointsRequired } from "../util/level";
import { pointAtom, levelAtom } from "../atoms/pointAtom";
import { useSetAtom } from "jotai";
import { useState } from "react";
import AlertForm from "./AlertForm";
import myDomain from "../util/mydomain";

const LevelForm = ({ setShowLevelForm }: { setShowLevelForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const setPoint = useSetAtom(pointAtom);
  const setLevel = useSetAtom(levelAtom);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTxt, setAlertTxt] = useState("");

  return showAlertForm ? (
    <AlertForm alertTxt={alertTxt} setShowAlertForm={setShowAlertForm} />
  ) : (
    <div className="overlay" onClick={() => setShowLevelForm(false)}>
      <div
        className="w-[250px] h-[400px] md:w-[250px] md:h-[450px] border-4 border-[#0f4c2e] rounded fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 beigeColor flex flex-col items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-[70%] min-h-14 md:min-h-16 flex justify-center items-center border-b border-gray-300">
          <div className="blankSpace w-[20%] h-full"></div>
          <div className="w-[60%] h-full flex justify-center items-center font-bold">등급</div>
          <button
            className="w-[20%] h-[60%] text-xs border rounded-xl hover:bg-[#0f4c2e] hover:text-white"
            onClick={async () => {
              const currentLevel = await getLevels();
              const currentPoint = await getPoints();
              if (Number(currentLevel) < 9) {
                if (Number(currentPoint) > pointsRequired[Number(currentLevel) + 1]) {
                  //등급 상승 서버로 전송
                  const anonId = localStorage.getItem("anonIdGP");
                  try {
                    const res = await fetch(`${myDomain}/levelUp/${anonId}`, {
                      method: "GET",
                    });
                    const data = await res.json();

                    if (res.status === 200) {
                      setAlertTxt(data.message);
                      const changedLevel = await getLevels();
                      const changedPoint = await getPoints();
                      setLevel(changedLevel);
                      setPoint(changedPoint);
                    } else if (res.status === 400) {
                      setAlertTxt(data.error);
                    }
                    setShowAlertForm(true);
                  } catch (err) {
                    alert(err);
                  }
                } else {
                  setAlertTxt("필요 포인트가 부족합니다.");
                  setShowAlertForm(true);
                }
              }
            }}
          >
            UP
          </button>
        </div>
        <div className="levelFormRow">
          <div className="levelFormLeftCell">새싹</div>
          <div className="levelFormRightCell">0p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">여린잎</div>
          <div className="levelFormRightCell">30p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">초록잎</div>
          <div className="levelFormRightCell">70p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">작은가지</div>
          <div className="levelFormRightCell">100p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">큰가지</div>
          <div className="levelFormRightCell">150p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">어린나무</div>
          <div className="levelFormRightCell">200p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">단단한나무</div>
          <div className="levelFormRightCell">300p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">큰나무</div>
          <div className="levelFormRightCell">500p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">녹음</div>
          <div className="levelFormRightCell">700p</div>
        </div>
        <div className="levelFormRow w-full h-20 flex justify-center items-center">
          <div className="levelFormLeftCell">거목</div>
          <div className="levelFormRightCell">1000p</div>
        </div>
      </div>
    </div>
  );
};

export default LevelForm;
