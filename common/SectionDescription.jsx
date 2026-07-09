 
const SectionDescription = ({ description, className = "" }) => {
    return (
      <p
      className={`text-[#141618] text-center text-[16px] lg:text-[18px] ${className}`}
    >
      {description}
    </p>
    );
};

export default SectionDescription;
