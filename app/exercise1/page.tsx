import Slider from "../../components/Slider/Slider";

export default async function Page() {
  return (
    <div className="container">
      <span>Exersice 1:</span>
      <Slider min={0} max={100} />
    </div>
  );
}
