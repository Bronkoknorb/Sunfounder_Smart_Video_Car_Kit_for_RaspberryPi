(function () {
  var img = document.getElementById("liveImg");

  var target_fps = 24;

  var request_start_time = performance.now();
  var start_time = performance.now();
  var time = 0;
  var request_time = 0;
  var time_smoothing = 0.9; // larger=more smoothing
  var request_time_smoothing = 0.2; // larger=more smoothing
  var target_time = 1000 / target_fps;

  var wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";

  var path = location.pathname;
  if (path.endsWith("index.html")) {
    path = path.substring(0, path.length - "index.html".length);
  }
  if (!path.endsWith("/")) {
    path = path + "/";
  }
  let ws = new WebSocket(wsProtocol + location.host + path + "video");

  function onOpen() {
    console.log("camera connection established");
    start_time = performance.now();
    requestImage();
  }

  function onMessage(evt) {
    var arrayBuffer = evt.data;
    var blob = new Blob([new Uint8Array(arrayBuffer)], { type: "image/jpeg" });
    img.src = window.URL.createObjectURL(blob);

    var end_time = performance.now();
    var current_time = end_time - start_time;
    // smooth with moving average
    time = time * time_smoothing + current_time * (1.0 - time_smoothing);
    start_time = end_time;

    var current_request_time = performance.now() - request_start_time;
    // smooth with moving average
    request_time =
      request_time * request_time_smoothing +
      current_request_time * (1.0 - request_time_smoothing);
    var timeout = Math.max(0, target_time - request_time);

    setTimeout(requestImage, timeout);
  }

  function connect() {
    ws = new WebSocket(wsProtocol + location.host + path + "video");
    ws.binaryType = "arraybuffer";

    ws.onopen = onOpen;
    ws.onmessage = onMessage;
  }

  function requestImage() {
    request_start_time = performance.now();
    ws.send("more");
  }

  connect();

  window.document.addEventListener("click", function (e) {
    if (ws.readyState === WebSocket.CLOSED) {
      console.log("Reconnecting to camera Websocket");
      connect();
    }
  });

  // TODO implementieren dass kamera abgeschaltet wird, wenn seite nicht visible (siehe hm-aquarium)
})();
