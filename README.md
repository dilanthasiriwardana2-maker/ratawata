# RataWata News Automation

Source code for the existing RataWata Cloudflare news Worker.

- Website: https://ratawata.online
- News API: https://summer-grass-0180ratawata-news-api.dilanthasiriwardana2.workers.dev
- Worker: `summer-grass-0180ratawata-news-api`
- Database: existing Cloudflare D1 database `ratawata-news`
- Existing schedules: 5-minute official alert checks and 30-minute regular news checks
- Daily cap: 15 newly inserted articles per Sri Lanka calendar day
- Sources: Ada Derana, Hiru News, BBC Sinhala, and the existing official weather-alert feed
- Image priority: source RSS image, article Open Graph image, then RataWata logo fallback
- Routine publishing does not require Workers AI or its daily free allocation

The production Pages website and D1 database are preserved. This repository stores the Worker source and does not replace the live Pages project.
