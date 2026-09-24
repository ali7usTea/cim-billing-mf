type ErrorsProps = {
  errors: any;
};
const Errors = ({ errors }: ErrorsProps) => {
  return (
    <div style={{ backgroundColor: "red", color: "white" }}>
      {Object.values(errors).map((error, index) => (
        <div key={index}>{`${error}`}</div>
      ))}
    </div>
  );
};
export default Errors;
