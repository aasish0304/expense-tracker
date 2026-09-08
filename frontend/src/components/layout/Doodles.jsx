import "./Doodles.css";
const Doodles = () => {
  return (
    <div
      className="waku-doodles"
      aria-hidden="true"
    >
      {/* Pink / red loop */}
      <svg
        className="doodle doodlePink"
        viewBox="0 0 120 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 49
             C18 25, 47 16, 65 28
             C82 39, 72 61, 50 65
             C29 69, 14 56, 20 41
             C27 24, 54 21, 68 34
             C79 44, 72 58, 59 67
             C48 75, 35 81, 24 92"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M67 34 C82 30, 95 24, 106 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>


      {/* Yellow / orange scribble */}
      <svg
        className="doodle doodleYellow"
        viewBox="0 0 120 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 59
             C29 39, 55 30, 72 38
             C86 45, 80 62, 62 67
             C44 72, 29 64, 34 51
             C39 39, 59 38, 70 46"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M68 46
             C76 55, 82 67, 96 76"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Doodles;