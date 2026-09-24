import React, { ImgHTMLAttributes } from "react";

interface FieldIconProps extends ImgHTMLAttributes<HTMLImageElement> {}

const FieldIcon: React.FC<FieldIconProps> = (props) => {
  return <img alt="field-icon" style={{ height: "20px" }} {...props} />;
};

export default FieldIcon;
