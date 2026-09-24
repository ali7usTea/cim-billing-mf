import React from "react";
import packageJson from "../../../package.json";

const Footer: React.FC = () => {
  function formatDateTime(datev: string): string {
    let date: Date = new Date(datev);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}${month}${day}-${hours}:${minutes}`;
  }
  return (
    <footer className="footer">
      <p className="text-xs">
        <span className="copyrightYear">
          &copy; {new Date().getFullYear()} CIM{" "}
        </span>{" "}
        All rights reserved&#160;&#160;|&#160;&#160;
        <span className="versionInfo">
          {packageJson.name} v:{packageJson.version} [
          {formatDateTime(__BUILD_DATE__)}]
          {/* &#160;|&#160;
                    {packageUi.name} version: {packageUi.version} */}
        </span>
      </p>
    </footer>
  );
};

export default Footer;
