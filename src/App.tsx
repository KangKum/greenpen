import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
// import Home from "./pages/Home";
import Writing from "./pages/Writing";
import Listening from "./pages/Listening";
// import Worry from "./pages/Worry";
import Layout from "./components/Layout";
import { getPoints, getLevels, signupOrLogin } from "./util/functions";
import { useSetAtom } from "jotai";
import { pointAtom, levelAtom } from "./atoms/pointAtom";

function App() {
  const setPoint = useSetAtom(pointAtom);
  const setLevel = useSetAtom(levelAtom);

  const setPoints = async () => {
    const newPoint = await getPoints();
    setPoint(newPoint);
  };

  const setLevels = async () => {
    const newLevel = await getLevels();
    setLevel(newLevel);
  };

  useEffect(() => {
    if (!localStorage.getItem("anonIdGP")) signupOrLogin();
    setPoints();
    setLevels();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Writing />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/listening" element={<Listening />} />
          {/* <Route path="/worry" element={<Worry />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
