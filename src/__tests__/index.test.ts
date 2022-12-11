import getSpotifySongName from "../functions/fetches";

(async () => {
  const r = await getSpotifySongName("Brighter Than Gold");

  return console.log(r.album);
})();
