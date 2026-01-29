import murdleLogo from "../assets/murdle-logo.png";

export default function Layout({ children }) {
  return (
    <>
      <div className="logo-container">
        <img src={murdleLogo} alt="Murdle" className="logo" />
      </div>

      {children}
    </>
  );
}
