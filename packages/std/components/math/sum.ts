import sum from "./specs/sum";

export default sum(({ inputs: { numbers } }) => {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return { sum };
});
