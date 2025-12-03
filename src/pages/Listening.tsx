import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { colors, txtColors } from "../util/color";
import myDomain from "../util/mydomain";
import Worry from "../components/Worry";

const Listening = () => {
  const [worryLetters, setWorryLetters] = useState<
    Array<{ _id: string; anonId: string; letter: string; writtenDate: string; attention: Array<string>; colorIndex: number }>
  >([]);
  // const navigate = useNavigate();
  const myAnonId = localStorage.getItem("anonIdGP") || "";
  const [showWorryModal, setShowWorryModal] = useState(false);
  const [selectedWorryId, setSelectedWorryId] = useState<string | null>(null);

  const fetchWorryLetters = async () => {
    try {
      const res = await fetch(`${myDomain}/listening`, {
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
    fetchWorryLetters();
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
                worry.anonId === myAnonId ? "border-2" : ""
              }`}
              style={{ backgroundColor: colors[worry.colorIndex % colors.length], color: txtColors[worry.colorIndex % txtColors.length] }}
              onClick={() => {
                setSelectedWorryId(worry._id);
                setShowWorryModal(true);
                // navigate("/worry", { state: { worryId: worry._id } });
              }}
            >
              <span className="littleBox w-full h-full block items-center p-3 cursor-pointer text-xs md:text-base">
                {worry.letter.length > 29 ? worry.letter.slice(0, 29) + "..." : worry.letter}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Listening;
