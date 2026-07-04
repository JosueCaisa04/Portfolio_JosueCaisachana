import https from "https";

const url = "https://drive.usercontent.google.com/download?id=1RLhgKN9J_7jQPBIZOmmPotUkdpVrgetj&export=download&confirm=t&uuid=54fa2108-243a-4868-84ce-2360980ff79b";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Range": "bytes=0-100"
};

https.get(url, { headers }, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers["content-type"]}`);
  console.log(`Content-Length: ${res.headers["content-length"]}`);
  console.log(`Content-Range: ${res.headers["content-range"]}`);
  res.resume();
}).on("error", (e) => {
  console.error(e);
});
