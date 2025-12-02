import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPoints } from "../util/functions";
import { useSetAtom } from "jotai";
import { pointAtom } from "../atoms/pointAtom";
import { colors, txtColors, borderColors } from "../util/color";
import { levels } from "../util/level";
import AlertForm from "../components/AlertForm";
import myDomain from "../util/mydomain";

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

const Worry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { worryId, anonId, letter, writtenDate, attention, colorIndex } = location.state || {};
  const [commentTxt, setCommentTxt] = useState("");
  const [comments, setComments] = useState<IComment[]>([]);
  const setPoint = useSetAtom(pointAtom);
  const [attentionList, setAttentionList] = useState(attention || []);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTxt, setAlertTxt] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`${myDomain}/worry/${worryId}`, {
        method: "GET",
      });
      if (res.status === 200) {
        const data = await res.json();
        // console.log(data);
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
        body: JSON.stringify({ worryId, anonId, commentWriter, commentTxt, commentTime: new Date().toISOString(), likes: [], dislikes: [] }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setCommentTxt("");
        localStorage.setItem("commentTime", new Date().toISOString());
        const newPoint = await getPoints();
        setPoint(newPoint);
        await fetchComments();
      } else {
        setAlertTxt(data.error);
        setShowAlertForm(true);
      }
    } catch (err) {
      setAlertTxt("댓글 등록에 실패했습니다.");
      setShowAlertForm(true);
    }
  };

  // const makeLikes = async (c: IComment) => {
  //   try {
  //     const res = await fetch(`${myDomain}/worry/like/${c._id}/${anonId}`, {
  //       method: "POST",
  //     });
  //     if (res.status === 200) {
  //       fetchComments();
  //     } else {
  //       console.error("Failed to like comment. Status:", res.status);
  //     }
  //   } catch (err) {
  //     console.error("Error liking comment:", err);
  //   }
  // };
  const makeLikes = async (c: IComment) => {
    // 1) UI 먼저 즉시 반영 (Optimistic Update)
    setComments((prev) =>
      prev.map((item) =>
        item._id === c._id
          ? {
              ...item,
              likes: c.likes.includes(anonId)
                ? c.likes.filter((id) => id !== anonId) // 좋아요 취소
                : [...c.likes, anonId], // 좋아요 추가
            }
          : item
      )
    );

    // 2) 서버 호출은 뒤에서 진행
    try {
      const res = await fetch(`${myDomain}/worry/like/${c._id}/${anonId}`, {
        method: "POST",
      });

      if (res.status !== 200) {
        console.error("Failed to like comment. Status:", res.status);

        // 3) 실패하면 UI 롤백
        fetchComments();
      }
    } catch (err) {
      console.error("Error liking comment:", err);
      fetchComments(); // 실패 시 원래 데이터 복원
    }
  };

  // const makeDislikes = async (c: IComment) => {
  //   try {
  //     const res = await fetch(`${myDomain}/worry/dislike/${c._id}/${anonId}`, {
  //       method: "GET",
  //     });
  //     if (res.status === 200) {
  //       fetchComments();
  //     } else {
  //       console.error("Failed to like comment. Status:", res.status);
  //     }
  //   } catch (err) {
  //     console.error("Error liking comment:", err);
  //   }
  // };
  const makeDislikes = async (c: IComment) => {
    // 1) UI 즉시 반영 (Optimistic)
    setComments((prev) =>
      prev.map((item) =>
        item._id === c._id
          ? {
              ...item,
              dislikes: c.dislikes.includes(anonId)
                ? c.dislikes.filter((id) => id !== anonId) // 싫어요 취소
                : [...c.dislikes, anonId], // 싫어요 추가
            }
          : item
      )
    );

    // 2) 서버 요청은 뒤에서 실행
    try {
      const res = await fetch(`${myDomain}/worry/dislike/${c._id}/${anonId}`, {
        method: "POST",
      });

      if (res.status !== 200) {
        console.error("싫어요 실패 → 롤백");
        fetchComments(); // 실패 시 원래 값 복원
      }
    } catch (err) {
      console.error("싫어요 오류:", err);
      fetchComments(); // 실패 시 롤백
    }
  };

  const makeAttention = async () => {
    try {
      const res = await fetch(`${myDomain}/worry/${worryId}/${anonId}`, {
        method: "GET",
      });
      const data = await res.json();
      if (res.status === 200) {
        setAttentionList(data.attentionList);
      } else {
        console.error("공감 실패");
      }
    } catch (err) {
      console.error("Error adding attention:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return showAlertForm ? (
    <AlertForm alertTxt={alertTxt} setShowAlertForm={setShowAlertForm} />
  ) : (
    <div
      className="w-full h-full bg-black/50 flex justify-center items-center"
      onClick={() => {
        navigate("/listening");
      }}
    >
      <div
        className="w-[90%] h-[70%] md:w-[700px] md:h-[600px] rounded-xl flex flex-col items-center bg-white p-4 overflow-y-auto"
        style={{ backgroundColor: colors[colorIndex], color: txtColors[colorIndex] }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="bodyPart w-full min-h-[250px] md:min-h-[350px] flex">{letter}</div>

        <div className="footerPart w-full h-[50px] mb-2 flex items-center">
          <div className="blankSpace w-[40%]"></div>
          <button
            className={`attentionPart w-[20%] h-8 md:h-9 text-sm md:text-base border-2 flex justify-center items-center rounded hover:font-medium ${
              attentionList.includes(anonId) ? "font-bold" : ""
            }`}
            onClick={() => makeAttention()}
          >
            공감 {attentionList.length}
          </button>
          <div className="datePart w-[40%] h-full flex flex-col items-end text-xs">
            <div>{new Date(writtenDate).toLocaleDateString().slice(0, -1)}</div>
            <div>{new Date(writtenDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        <div className="bottomPart w-full flex flex-col">
          <form className="w-full min-h-32 flex flex-col">
            <textarea
              className="w-full h-[75%] px-2 py-1 overflow-y-auto rounded text-black"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
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
                  <div key={c.commentTime} className={`w-[97%] mx-auto flex flex-col border-b px-1 mt-2`} style={{ borderColor: borderColors[colorIndex] }}>
                    <div className="w-full flex justify-between mb-1">
                      <div className="h-full text-sm font-bold">{anonId === c.commentWriter ? "글쓴이" : c.level != null ? levels[c.level] : "낙엽"}</div>
                      <div className="h-full text-xs flex items-center">{new Date(c.commentTime).toLocaleString()}</div>
                    </div>
                    <div className="w-full text-sm">{c.commentTxt}</div>
                    <div className="w-full flex justify-end gap-4 mb-2">
                      <button
                        type="button"
                        className={`text-sm hover:font-medium ${c.likes.includes(anonId) ? "font-bold" : ""}`}
                        onClick={async () => makeLikes(c)}
                      >
                        Good {c.likes ? c.likes.length : 0}
                      </button>
                      <button
                        type="button"
                        className={`text-sm hover:font-medium ${c.dislikes.includes(anonId) ? "font-bold" : ""}`}
                        onClick={async () => makeDislikes(c)}
                      >
                        Bad {c.dislikes ? c.dislikes.length : 0}
                      </button>
                    </div>
                  </div>
                ))
              : "댓글이 없습니다"}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Worry;
