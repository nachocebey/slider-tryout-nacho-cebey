import Slider from "../components/Slider/Slider";

async function getData() {
  const response = await fetch("http://demo1019064.mockable.io/numbers");
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

export default async function Page() {
  const data = await getData();
  return (
    <div className="container">
      <span>Exersice 1:</span>
      <Slider min={0} max={100} />
      <br></br>
      <span>Exersice 2:</span>
      <Slider rangeValues={data} />
    </div>
  );
}
