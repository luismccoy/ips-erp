#!/bin/bash
npx playwright screenshot file://$(pwd)/preview.html section-full.png --viewport-size=1920,8000
