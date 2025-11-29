import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
  return (
    <div className="w-screen h-screen overflow-x-hidden beigeColor">
      <Header />
      <main className="w-full h-[calc(100%-3rem)]">
        <Outlet /> {/* 각 페이지 컴포넌트가 여기에 렌더링됨 */}
      </main>
    </div>
  );
}

export default Layout;
