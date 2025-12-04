import { useState, useEffect } from "react";
import { colors, txtColors } from "../util/color";
import myDomain from "../util/mydomain";
import Worry from "../components/Worry";

const Listening = () => {
  const [worryLetters, setWorryLetters] = useState<
    Array<{ _id: string; anonId: string; letter: string; writtenDate: string; attention: Array<string>; colorIndex: number }>
  >([]);
  const myAnonId = localStorage.getItem("anonIdGP") || "";
  const [showWorryModal, setShowWorryModal] = useState(false);
  const [selectedWorryId, setSelectedWorryId] = useState<string | null>(null);
  const [limit, setLimit] = useState(48);

  const fetchWorryLetters = async (limitNum: number) => {
    try {
      const res = await fetch(`${myDomain}/listening?limit=${limitNum}`, {
        method: "GET",
      });
      if (res.status === 200) {
        const data = await res.json();
        setWorryLetters(data);
      } else {
        console.error("Failed to fetch worry letters. Status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching worry letters:", err);
    }
  };

  useEffect(() => {
    fetchWorryLetters(limit);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center overflow-y-auto">
      {showWorryModal ? (
        <Worry setShowWorryModal={setShowWorryModal} setSelectedWorryId={setSelectedWorryId} worryId={selectedWorryId || ""} />
      ) : (
        <div className="w-[90%] md:w-[50%] flex flex-wrap justify-center mt-10 md:mt-28">
          {worryLetters.map((worry) => (
            <div
              key={worry._id}
              className={`worry-card letterSmallContainer w-[100px] h-[100px] m-2 md:w-[150px] md:h-[150px] md:m-4 rounded-xl shadow ${
                worry.anonId === myAnonId ? "border-b-6 border-white" : ""
              }`}
              style={{ backgroundColor: colors[worry.colorIndex % colors.length], color: txtColors[worry.colorIndex % txtColors.length] }}
              onClick={() => {
                setSelectedWorryId(worry._id);
                setShowWorryModal(true);
              }}
            >
              <span className="littleBox w-full h-full block items-center p-3 cursor-pointer text-xs md:text-base">
                {worry.letter.length > 29 ? worry.letter.slice(0, 29) + "..." : worry.letter}
              </span>
            </div>
          ))}
        </div>
      )}
      <span className="cursor-default text-transparent">그린펜</span>
      <button
        className="mt-4 text-sm p-2 bg-gray-100 rounded w-[80%] md:w-[45%]"
        onClick={() => {
          setLimit((prev) => prev + 24);
          fetchWorryLetters(limit + 24);
        }}
      >
        더보기
      </button>
    </div>
  );
};
export default Listening;
