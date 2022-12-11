function millisecondsToDuration(ms: number) {
  var minutes = Math.floor(ms / 60000);
  var seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes + ":" + (ms < 10 ? "0" : "") + seconds;
}

export default millisecondsToDuration;
