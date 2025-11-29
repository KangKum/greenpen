const AlertForm = ({ alertTxt, setShowAlertForm }: { alertTxt: string; setShowAlertForm: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="overlay" onClick={() => setShowAlertForm(false)}>
      <div className="w-[270px] h-16 border-4 mainColor text-white border-[#0f4c2e] rounded fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
        {alertTxt}
      </div>
    </div>
  );
};

export default AlertForm;
