#!/bin/bash
for file in src/App.tsx src/main.tsx src/components/LandingPage.tsx src/components/InventoryDashboard.tsx src/components/NurseDashboard.tsx src/components/PatientDashboard.tsx src/components/AdminRoster.tsx vite.config.ts tsconfig.json src/services/integration-layer.ts src/amplify-utils.ts; do
  echo -e "\n=== FILENAME ===\n$file" >> project_export.txt
  cat "$file" >> project_export.txt
  echo -e "\n=== END ===" >> project_export.txt
done
