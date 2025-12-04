import { LuThumbsUp, LuThumbsDown } from "react-icons/lu";

const PointForm = ({ setShowPointForm }: { setShowPointForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="overlay" onClick={() => setShowPointForm(false)}>
      <div
        className="w-[250px] h-[220px] md:w-[250px] md:h-[250px] border-4 border-[#0f4c2e] rounded fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 beigeColor z-50 flex flex-col items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-[70%] h-14 md:h-16 flex justify-center items-center font-bold border-b border-gray-300">포인트 가이드</div>
        <div className="pointFormRow">
          <div className="pointFormLeftCell">글 작성</div>
          <div className="pointFormRightCell">+5p</div>
        </div>

        <div className="pointFormRow">
          <div className="pointFormLeftCell">공감</div>
          <div className="pointFormRightCell">+3p</div>
        </div>

        <div className="pointFormRow">
          <div className="pointFormLeftCell">댓글 작성</div>
          <div className="pointFormRightCell">+2p</div>
        </div>

        <div className="pointFormRow">
          <div className="pointFormLeftCell">
            댓글 <LuThumbsUp className="ml-2" />
          </div>
          <div className="pointFormRightCell">+2p</div>
        </div>

        <div className="pointFormRow">
          <div className="pointFormLeftCell">
            댓글 <LuThumbsDown className="ml-2" />
          </div>
          <div className="pointFormRightCell">-1p</div>
        </div>
      </div>
    </div>
  );
};

export default PointForm;
