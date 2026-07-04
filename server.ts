import express from "express";
import path from "path";
import https from "https";
// @ts-ignore
import convert from "heic-convert";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  interface CacheEntry {
    confirmUrl: string;
    cookieJar: Record<string, string>;
    timestamp: number;
  }
  const proxyCache = new Map<string, CacheEntry>();

  // Google Drive Video Proxy API Route with virus scan bypass and Range streaming support
  app.get("/api/video-proxy", (req, res) => {
    const fileId = req.query.id;
    if (!fileId || typeof fileId !== "string") {
      console.log("[Proxy] Error: Missing file ID");
      return res.status(400).send("File ID is required");
    }

    const cleanFileId: string = fileId;
    const range = req.headers.range;
    console.log(`\n[Proxy] Incoming request for file ID: ${cleanFileId}, Range: ${range}`);
    const initialUrl = `https://docs.google.com/uc?export=download&id=${cleanFileId}`;

    // Cookie jar to accumulate and send cookies across requests
    const cookieJar: Record<string, string> = {};

    function parseCookies(cookieHeaders: string[]) {
      cookieHeaders.forEach((cookieStr) => {
        const firstPart = cookieStr.split(";")[0];
        if (firstPart) {
          const eqIdx = firstPart.indexOf("=");
          if (eqIdx !== -1) {
            const key = firstPart.substring(0, eqIdx).trim();
            const value = firstPart.substring(eqIdx + 1).trim();
            cookieJar[key] = value;
          }
        }
      });
    }

    function serializeCookies() {
      return Object.entries(cookieJar)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
    }

    // Shared parser function for the virus warning page
    function processWarningPage(body: string, targetUrl: string) {
      // Extract inputs
      const inputs: Record<string, string> = {};
      const regex = /<input\s+[^>]*name=["']([^"']+)["']\s+[^>]*value=["']([^"']*)["']/gi;
      let m;
      while ((m = regex.exec(body)) !== null) {
        inputs[m[1]] = m[2];
      }

      // Also check reverse attribute order value/name
      const regexReverse = /<input\s+[^>]*value=["']([^"']*)["']\s+[^>]*name=["']([^"']+)["']/gi;
      while ((m = regexReverse.exec(body)) !== null) {
        inputs[m[2]] = m[1];
      }

      // Parse form action URL
      const actionMatch = body.match(/action="([^"]+)"/i) || body.match(/action='([^']+)'/i);
      const actionUrl = actionMatch ? actionMatch[1].replace(/&amp;/g, "&") : "https://drive.usercontent.google.com/download";

      if (inputs.confirm) {
        const target = new URL(actionUrl, targetUrl);
        Object.entries(inputs).forEach(([name, val]) => {
          target.searchParams.set(name, val);
        });
        requestStream(target.toString(), false);
      } else {
        console.error("Warning: Could not parse Google Drive confirm token. Body excerpt:", body.substring(0, 800));
        res.status(500).send("Unable to parse Google Drive warning page. No confirm token found.");
      }
    }

    function requestStream(targetUrl: string, isFromCache = false) {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };

      const cookieStr = serializeCookies();
      if (cookieStr) {
        headers["Cookie"] = cookieStr;
      }

      if (range) {
        headers["Range"] = range;
      }

      https.get(targetUrl, { headers }, (googleRes) => {
        const statusCode = googleRes.statusCode || 200;
        const contentType = googleRes.headers["content-type"] || "";
        
        // If the request fails and we used cached credentials, they might have expired.
        // Evict from cache, clear cookies, and restart flow from scratch.
        if (statusCode >= 400 && isFromCache) {
          console.log(`[Proxy] Cached request failed with status ${statusCode}. Evicting from cache and retrying.`);
          proxyCache.delete(cleanFileId);
          for (const key in cookieJar) {
            delete cookieJar[key];
          }
          googleRes.resume();
          requestStream(initialUrl, false);
          return;
        }

        // Accumulate cookies from headers
        const setCookies = googleRes.headers["set-cookie"] || [];
        parseCookies(setCookies);

        // Handle Redirects (301, 302, 303, 307, 308) with correct relative URL resolution
        if (statusCode >= 300 && statusCode < 400 && googleRes.headers.location) {
          googleRes.resume(); // free connection memory
          const resolvedUrl = new URL(googleRes.headers.location, targetUrl).toString();
          requestStream(resolvedUrl, isFromCache);
          return;
        }

        // Handle virus scan warning page if content type is text/html
        if (contentType.includes("text/html")) {
          if (isFromCache) {
            // The cached download URL or cookies might have expired.
            // Evict from cache, clear cookies, and restart flow from scratch.
            proxyCache.delete(cleanFileId);
            for (const key in cookieJar) {
              delete cookieJar[key];
            }
            googleRes.resume();
            requestStream(initialUrl, false);
            return;
          }

          // If we got HTML but had a Range header, we need to request the warning page
          // without the Range header to guarantee we get the full form HTML layout.
          if (headers["Range"]) {
            googleRes.resume(); // Discard the partial HTML stream
            const cleanHeaders = { ...headers };
            delete cleanHeaders["Range"];
            
            const updatedCookieStr = serializeCookies();
            if (updatedCookieStr) {
              cleanHeaders["Cookie"] = updatedCookieStr;
            }

            https.get(targetUrl, { headers: cleanHeaders }, (htmlRes) => {
              // Parse cookies from the HTML warning page response!
              const setCookiesHtml = htmlRes.headers["set-cookie"] || [];
              parseCookies(setCookiesHtml);

              let body = "";
              htmlRes.on("data", (chunk) => {
                body += chunk;
                if (body.length > 100000) {
                  htmlRes.destroy();
                }
              });
              htmlRes.on("end", () => {
                processWarningPage(body, targetUrl);
              });
            }).on("error", (err) => {
              console.error("Proxy error during HTML warning page fetch:", err);
              if (!res.headersSent) {
                res.status(500).send(`Proxy error: ${err.message}`);
              }
            });
            return;
          }

          let body = "";
          googleRes.on("data", (chunk) => {
            body += chunk;
            if (body.length > 100000) { // Limit read size
              googleRes.destroy();
            }
          });

          googleRes.on("end", () => {
            processWarningPage(body, targetUrl);
          });
          return;
        }

        // File stream success! Pass status code and headers back to browser
        // Save to cache so subsequent requests can bypass the warning flow
        if (!isFromCache && (contentType.includes("video/") || contentType.includes("application/"))) {
          proxyCache.set(cleanFileId, {
            confirmUrl: targetUrl,
            cookieJar: { ...cookieJar },
            timestamp: Date.now()
          });
        }

        let finalContentType = googleRes.headers["content-type"] || "";
        const contentDisposition = googleRes.headers["content-disposition"] || "";
        const isHeic = 
          contentDisposition.toLowerCase().includes(".heic") || 
          contentDisposition.toLowerCase().includes(".heif") ||
          finalContentType.toLowerCase().includes("heic") ||
          finalContentType.toLowerCase().includes("heif");

        if (isHeic) {
          const chunks: any[] = [];
          googleRes.on("data", (chunk) => {
            chunks.push(chunk);
          });
          googleRes.on("end", async () => {
            try {
              const inputBuffer = Buffer.concat(chunks);
              console.log(`[Proxy] Converting HEIC image (${inputBuffer.length} bytes) to JPEG...`);
              const outputBuffer = await convert({
                buffer: inputBuffer,
                format: "JPEG",
                quality: 0.9
              });
              res.setHeader("Content-Type", "image/jpeg");
              res.setHeader("Content-Length", outputBuffer.length);
              res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
              res.status(statusCode).send(outputBuffer);
            } catch (err: any) {
              console.error("[Proxy] HEIC conversion failed:", err);
              res.setHeader("Content-Type", "image/heic");
              res.status(statusCode).send(Buffer.concat(chunks));
            }
          });
          return;
        }

        res.status(statusCode);

        const isPdf = 
          contentDisposition.toLowerCase().includes(".pdf") ||
          finalContentType.toLowerCase().includes("pdf") ||
          req.query.type === "pdf" ||
          req.query.id === "1sCegLRbbl3nvFEqdJrOAJ36tElIRor64";

        if (isPdf) {
          finalContentType = "application/pdf";
          if (req.query.download === "true") {
            res.setHeader("Content-Disposition", 'attachment; filename="JosueCaisachana_CV.pdf"');
          } else {
            res.setHeader("Content-Disposition", 'inline; filename="JosueCaisachana_CV.pdf"');
          }
        } else {
          // Normalize Content-Type to video/mp4 for browser compatibility, but preserve image types
          const isImage = 
            finalContentType.startsWith("image/") || 
            req.query.type === "image";

          if (isImage) {
            if (!finalContentType || finalContentType === "application/octet-stream") {
              finalContentType = "image/jpeg";
            }
          } else {
            if (
              !finalContentType ||
              finalContentType === "application/octet-stream" || 
              finalContentType.startsWith("application/x-") || 
              finalContentType === "application/binary" ||
              finalContentType === "binary/octet-stream"
            ) {
              finalContentType = "video/mp4";
            }
          }
        }
        res.setHeader("Content-Type", finalContentType);

        if (googleRes.headers["content-length"]) {
          res.setHeader("Content-Length", googleRes.headers["content-length"]);
        }

        if (googleRes.headers["content-range"]) {
          res.setHeader("Content-Range", googleRes.headers["content-range"]);
        }

        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

        // Pipe stream directly to browser
        googleRes.pipe(res);

        // Terminate google stream if client disconnects
        res.on("close", () => {
          googleRes.destroy();
        });
      }).on("error", (err) => {
        console.error("Proxy error:", err);
        if (!res.headersSent) {
          res.status(500).send(`Proxy error: ${err.message}`);
        }
      });
    }

    const cached = proxyCache.get(cleanFileId);
    // Use cache if it's less than 30 minutes old
    if (cached && (Date.now() - cached.timestamp < 1800000)) {
      Object.assign(cookieJar, cached.cookieJar);
      requestStream(cached.confirmUrl, true);
    } else {
      requestStream(initialUrl, false);
    }
  });

  // Vite development middleware vs Static Production files
  const isProduction = 
    process.env.NODE_ENV === "production" || 
    (typeof __dirname !== "undefined" && (__dirname.endsWith("dist") || __dirname.includes("dist")));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    let distPath = path.join(process.cwd(), "dist");
    if (typeof __dirname !== "undefined") {
      const isCompiled = __dirname.endsWith("dist");
      if (isCompiled) {
        distPath = __dirname;
      }
    }
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
