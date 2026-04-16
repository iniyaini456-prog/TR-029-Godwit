#!/bin/bash
# Demo Launcher - Run this to see the full ERP integration demo

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║    AI Supply Chain Simulation Platform - Demo Launcher            ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "This will start 2 servers:"
echo "  1. Mock ERP Server (port 8080) - simulates SAP/Oracle/NetSuite"
echo "  2. React App (port 3000) - the web interface"
echo ""
echo "Press ENTER to continue..."
read

echo ""
echo "Starting Mock ERP Server..."
echo "---"
npm run server &
ERP_PID=$!

# Wait for server to start
sleep 2

echo ""
echo "Starting React Application with ERP Connection..."
echo "---"
VITE_ERP_API_BASE=http://localhost:8080 npm run dev

# Cleanup on exit
trap "kill $ERP_PID" EXIT
