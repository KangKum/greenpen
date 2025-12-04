import { useEffect, useState } from "react";
import { getPoints } from "../util/functions";
import { useSetAtom } from "jotai";
import { pointAtom } from "../atoms/pointAtom";
import { colors, txtColors, borderColors } from "../util/color";
import { levels } from "../util/level";
import AlertForm from "./AlertForm";
import myDomain from "../util/mydomain";
import LoadingSpinner from "./LoadingSpinner";
import { LuThumbsUp, LuThumbsDown } from "react-icons/lu";

{
  /* <LuThumbsUp /> */
}
{
  /* <LuThumbsDown /> */
}
interface IComment {
  _id: string;
  commentTxt: string;
  commentTime: string;
  worryId: string;
  anonId: string;
  commentWriter: string;
  likes: string[];
  dislikes: string[];
  level: number;
}
interface IWorry {
  _id: string;
  letter: string;
  writtenDate: string;
  anonId: string;
  colorIndex: number;
  attention: string[];
}

const Worry = ({
  setShowWorryModal,
  setSelectedWorryId,
  worryId,
}: {
  setShowWorryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedWorryId: React.Dispatch<React.SetStateAction<string | null>>;
  worryId: string;
}) => {
  const [thisWorry, setThisWorry] = useState<IWorry>({} as IWorry);
  const [commentTxt, setCommentTxt] = useState("");
  const [comments, setComments] = useState<IComment[]>([]);
  const setPoint = useSetAtom(pointAtom);
  const [attentionList, setAttentionList] = useState<string[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTxt, setAlertTxt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchWorry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${myDomain}/thisWorry/${worryId}`, {
        method: "GET",
      });
      if (res.status === 200) {
        const data = await res.json();
        setThisWorry(data);
        setAttentionList(data.attention);
      } else {
        console.error("Failed to fetch worry. Status:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch worry. Status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchComments = async (limitNum: number) => {
    try {
      const res = await fetch(`${myDomain}/worry/${worryId}?limit=${limitNum}`, {
        method: "GET",
      });
      if (res.status === 200) {
        const data = await res.json();
        setComments(data || []);
      } else {
        console.error("Failed to fetch comments. Status:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };
  const makeComment = async () => {
    // 도배방지
    const commentWriter = localStorage.getItem("anonIdGP");
    const lastCommentTime = localStorage.getItem("commentTime");
    if (lastCommentTime) {
      const elapsed = new Date().getTime() - new Date(lastCommentTime).getTime();
      if (elapsed < 20000) {
        setAlertTxt("너무 자주 글을 쓸 수 없습니다.");
        setShowAlertForm(true);
        return;
      }
    }
    // 댓글 등록 로직 추가 가능
    try {
      const res = await fetch(`${myDomain}/worry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ worryId, anonId: thisWorry.anonId, commentWriter, commentTxt, commentTime: new Date().toISOString(), likes: [], dislikes: [] }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setShowAlertForm(true);
        setAlertTxt("댓글이 등록되었습니다.");
        setCommentTxt("");
        localStorage.setItem("commentTime", new Date().toISOString());
        // 병렬 처리
        const [newPoint] = await Promise.all([getPoints(), fetchComments(10)]);
        setPoint(newPoint);
      } else {
        setAlertTxt(data.error);
        setShowAlertForm(true);
      }
    } catch (err) {
      setAlertTxt("댓글 등록에 실패했습니다.");
      setShowAlertForm(true);
    }
  };
  const makeLikes = async (c: IComment) => {
    // 1) UI 먼저 즉시 반영 (Optimistic Update)
    setComments((prev) =>
      prev.map((item) =>
        item._id === c._id
          ? {
              ...item,
              likes: c.likes.includes(thisWorry.anonId)
                ? c.likes.filter((id) => id !== thisWorry.anonId) // 좋아요 취소
                : [...c.likes, thisWorry.anonId], // 좋아요 추가
            }
          : item
      )
    );

    // 2) 서버 호출은 뒤에서 진행
    try {
      const res = await fetch(`${myDomain}/worry/like/${c._id}/${thisWorry.anonId}`, {
        method: "POST",
      });

      if (res.status !== 200) {
        console.error("Failed to like comment. Status:", res.status);

        // 3) 실패하면 UI 롤백
        fetchComments(10);
      }
    } catch (err) {
      console.error("Error liking comment:", err);
      fetchComments(10); // 실패 시 원래 데이터 복원
    }
  };
  const makeDislikes = async (c: IComment) => {
    // 1) UI 즉시 반영 (Optimistic)
    setComments((prev) =>
      prev.map((item) =>
        item._id === c._id
          ? {
              ...item,
              dislikes: c.dislikes.includes(thisWorry.anonId)
                ? c.dislikes.filter((id) => id !== thisWorry.anonId) // 싫어요 취소
                : [...c.dislikes, thisWorry.anonId], // 싫어요 추가
            }
          : item
      )
    );

    // 2) 서버 요청은 뒤에서 실행
    try {
      const res = await fetch(`${myDomain}/worry/dislike/${c._id}/${thisWorry.anonId}`, {
        method: "POST",
      });

      if (res.status !== 200) {
        console.error("싫어요 실패 → 롤백");
        fetchComments(10); // 실패 시 원래 값 복원
      }
    } catch (err) {
      console.error("싫어요 오류:", err);
      fetchComments(10); // 실패 시 롤백
    }
  };
  const makeAttention = async () => {
    // 1) UI 즉시 반영 (Optimistic)
    setAttentionList((prev) => (prev.includes(thisWorry.anonId) ? prev.filter((id) => id !== thisWorry.anonId) : [...prev, thisWorry.anonId]));

    // 2) 서버 요청은 뒤에서 실행
    try {
      const res = await fetch(`${myDomain}/worry/${worryId}/${thisWorry.anonId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 200) {
        setAttentionList(data.attentionList);
      } else {
        console.error("공감 실패");
        fetchWorry(); // 실패 시 원래 값 복원
      }
    } catch (err) {
      console.error("Error adding attention:", err);
      fetchWorry(); // 실패 시 롤백
    }
  };
  const addVisited = (worryId: string) => {
    const visited = localStorage.getItem("VisitedWorries");
    let visitedArray = visited ? JSON.parse(visited) : [];
    if (!visitedArray.includes(worryId)) {
      visitedArray.push(worryId);
      localStorage.setItem("VisitedWorries", JSON.stringify(visitedArray));
    }
  };
  const formatYMDHM = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}. ${hh}:${min}`;
  };

  useEffect(() => {
    fetchWorry();
    fetchComments(10);
    addVisited(worryId);
  }, []);

  return isLoading ? (
    <LoadingSpinner />
  ) : showAlertForm ? (
    <AlertForm alertTxt={alertTxt} setShowAlertForm={setShowAlertForm} />
  ) : (
    <div
      className="overlay"
      onClick={() => {
        setSelectedWorryId(null);
        setShowWorryModal(false);
      }}
    >
      <div
        className="w-[90%] h-[70%] md:w-[700px] md:h-[600px] rounded-xl flex flex-col items-center bg-white p-4 overflow-y-auto"
        style={{ backgroundColor: colors[thisWorry.colorIndex], color: txtColors[thisWorry.colorIndex] }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="bodyPart w-full min-h-[250px] md:min-h-[350px] flex">{thisWorry.letter}</div>

        <div className="footerPart w-full h-[50px] mb-2 flex items-center">
          <div className="blankSpace w-[40%]"></div>
          <button
            className={`attentionPart w-[20%] h-8 md:h-9 text-sm md:text-base border-2 flex justify-center items-center rounded hover:font-medium ${
              attentionList.includes(thisWorry.anonId) ? "font-bold" : ""
            }`}
            onClick={() => makeAttention()}
          >
            공감 {attentionList.length}
          </button>
          <div className="datePart w-[40%] h-full flex flex-col items-end text-xs">
            <div>{new Date(thisWorry.writtenDate).toLocaleDateString().slice(0, -1)}</div>
            <div>{new Date(thisWorry.writtenDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        <div className="bottomPart w-full flex flex-col">
          <form className="w-full min-h-32 flex flex-col">
            <textarea
              className="w-full h-[75%] px-2 py-1 overflow-y-auto rounded-lg text-black"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
              spellCheck={false}
              value={commentTxt}
              onChange={(e) => setCommentTxt(e.target.value)}
            ></textarea>
            <div className="w-full h-[25%] mt-1 flex justify-end">
              <button type="button" className="w-10 h-[90%] text-xs md:text-sm border rounded hover:font-medium" onClick={() => makeComment()}>
                등록
              </button>
            </div>
          </form>
          <div className="blankSpace h-2"></div>
          <div className="commentPart w-full min-h-20 flex flex-col justify-center items-center">
            {comments.length > 0
              ? comments.map((c) => (
                  <div
                    key={c.commentTime}
                    className={`w-[97%] mx-auto flex flex-col border-b px-1 mt-2`}
                    style={{ borderColor: borderColors[thisWorry.colorIndex] }}
                  >
                    <div className="w-full flex justify-between mb-1">
                      <div className="h-full text-sm font-bold">
                        {thisWorry.anonId === c.commentWriter ? "글쓴이" : c.level != null ? levels[c.level] : "낙엽"}
                      </div>
                      <div className="h-full text-xs flex items-center">{formatYMDHM(c.commentTime)}</div>
                    </div>
                    <div className="w-full text-sm">{c.commentTxt}</div>
                    <div className="w-full flex justify-end gap-4 mb-2">
                      <button
                        type="button"
                        className={`text-sm hover:font-medium flex justify-center items-center gap-0.5 ${
                          c.likes.includes(thisWorry.anonId) ? "font-bold" : ""
                        }`}
                        onClick={async () => makeLikes(c)}
                      >
                        <LuThumbsUp className="flex justify-center items-center" /> <span className="flex">{c.likes ? c.likes.length : 0}</span>
                      </button>
                      <button
                        type="button"
                        className={`text-sm hover:font-medium flex justify-center items-center gap-0.5 ${
                          c.dislikes.includes(thisWorry.anonId) ? "font-bold" : ""
                        }`}
                        onClick={async () => makeDislikes(c)}
                      >
                        <LuThumbsDown className="flex justify-center items-center" /> <span className="flex">{c.dislikes ? c.dislikes.length : 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              : "댓글이 없습니다"}
          </div>
          <button
            className="mt-4 text-sm md:text-base p-2 rounded bg-white/30 w-[50%] md:w-[30%] mx-auto hover:font-bold active:font-bold"
            onClick={() => {
              setLimit((prev) => prev + 10);
              fetchComments(limit + 10);
            }}
          >
            더보기
          </button>
        </div>
      </div>
    </div>
  );
};
export default Worry;
