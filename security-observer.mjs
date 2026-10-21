import { installSecurityObserver } from './security-http.mjs';
// Public digest only. The read key stays on the Directorate collector.
installSecurityObserver({
  "sourceId": "app-72e82a10-6e21-4764-874c-46d173cdc54d",
  "keyHash": "2421d51c6f1af85335c3bbc1f1254561a01ed442f8cc86a362f2d3bba98c08e5",
  "bindings": [
    {
      "hosts": [
        "swordandshield.games"
      ],
      "prefix": "/",
      "target": "Sword and Shield"
    }
  ],
  "fallbackTarget": "Sword and Shield",
  "digitalOcean": true
});
