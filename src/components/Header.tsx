import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { getPoints, getLevels } from "../util/functions";
import { useAtomValue } from "jotai";
import { pointAtom, levelAtom } from "../atoms/pointAtom";
import LevelForm from "./LevelForm";
import PointForm from "./PointForm";
import { levels } from "../util/level";

const Header = () => {
  const point = useAtomValue(pointAtom);
  const level = useAtomValue(levelAtom);
  const location = useLocation();
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showPointForm, setShowPointForm] = useState(false);

  useEffect(() => {
    getPoints();
    getLevels();
  }, []);

  return (
    <header className="w-full h-20 mt-1 mb-2 md:mb-0 md:mt-0 md:h-12 flex flex-col md:flex-row justify-between items-center beigeColor">
      {showLevelForm && <LevelForm setShowLevelForm={setShowLevelForm} />}
      {showPointForm && <PointForm setShowPointForm={setShowPointForm} />}
      <div className="hidden md:leftDiv md:w-100 md:h-full md:flex md:items-center">
        <Link to={"/"} className="h-6 ml-2 flex">
          <img src="/images/logo.png" alt="Logo" className="h-full" />
        </Link>
      </div>
      <div className="centerDiv w-full md:w-64 h-full flex flex-col md:flex-row justify-center items-center gap-2">
        <div className="md:hidden w-full h-10 mt-2 flex justify-between">
          <div className="flex w-[50%] h-[90%]">
            <Link to={"/"} className="h-6 ml-2 flex">
              <img src="/images/logo.png" alt="Logo" className="h-full" />
            </Link>
          </div>
          <div className="flex w-[50%] h-[90%] justify-end gap-1">
            <div
              className="h-[90%] w-22 flex justify-center items-center bg-white text-white text-sm mainColor rounded-lg cursor-pointer"
              onClick={() => setShowLevelForm(true)}
            >
              {levels[level]}
            </div>
            <div
              className="h-[90%] w-16 flex justify-center items-center border-3 bg-white text-sm mainTextColor rounded-lg cursor-pointer"
              onClick={() => setShowPointForm(true)}
            >
              {point} p
            </div>
          </div>
        </div>
        <div className="w-full h-10 flex justify-center items-center">
          {" "}
          <Link
            to={"/writing"}
            className={`w-20 h-full text-black/70 ${location.pathname === "/" || location.pathname === "/writing" ? "font-bold" : ""} hover:text-black`}
          >
            털어놓기
          </Link>
          <Link
            to={"/listening"}
            className={`w-20 h-full text-black/70 ${location.pathname === "/listening" || location.pathname === "/worry" ? "font-bold" : ""} hover:text-black`}
          >
            들어주기
          </Link>
        </div>
      </div>
      <div className="hidden md:rightDiv md:w-100 md:h-[80%] md:flex md:justify-between md:items-center md:pl-40 md:pr-2 md:mr-1 md:rounded">
        <div
          className="h-[90%] w-30 flex justify-center items-center bg-white text-white mainColor rounded-lg cursor-pointer"
          onClick={() => setShowLevelForm(true)}
        >
          {levels[level]}
        </div>
        <div
          className="h-[90%] w-26 flex justify-center items-center border-3 bg-white mainTextColor rounded-lg cursor-pointer"
          onClick={() => setShowPointForm(true)}
        >
          {point} point
        </div>
      </div>
    </header>
  );
};

export default Header;
