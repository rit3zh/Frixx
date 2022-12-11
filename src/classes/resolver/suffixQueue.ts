import Types from "../../interfaces/MusicTypes/MusicTypes";
export default function shuffleQueue(queue: Types[]) {
  let array1 = [...queue];
  for (let index = array1?.length - 1; index > 0; index--) {
    const newIndex = Math?.floor(Math?.random() * (index + 1));
    [array1[index], array1[newIndex]] = [array1[newIndex], array1[index]];
  }
  return array1;
}
